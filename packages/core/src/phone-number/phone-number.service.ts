import {
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	PhoneNumber,
	PhoneNumberAssignment,
	PhoneNumberSource,
	PhoneNumberStatus,
	Prisma,
	PrismaClient,
} from '@prisma/client';

import { DbService } from '@/db/db.service';
import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { SubscriptionService } from '@/subscription/subscription.service';

import { CreatePhoneNumberDto } from './dto/request/create-phone-number.dto';
import { PhoneNumberFilterDto } from './dto/request/phone-number-filter.dto';

@Injectable()
export class PhoneNumberService {
	constructor(
		private readonly db: DbService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
	) {}

	async getOverview() {
		const countRows = await this.db.phoneNumber.groupBy({
			by: ['status'],
			_count: true,
		});

		let total = 0;
		const counts: Record<PhoneNumberStatus, number> = {
			[PhoneNumberStatus.INITIAL]: 0,
			[PhoneNumberStatus.AVAILABLE]: 0,
			[PhoneNumberStatus.RESERVED]: 0,
			[PhoneNumberStatus.ASSIGNED]: 0,
		};
		for (const row of countRows) {
			total += row._count;
			counts[row.status] = row._count;
		}

		return {
			total: total,
			initial: counts.INITIAL,
			available: counts.AVAILABLE,
			assigned: counts.ASSIGNED,
			reserved: counts.RESERVED,
		};
	}

	async create(dto: CreatePhoneNumberDto) {
		return this.db.phoneNumber.upsert({
			where: {
				msisdn: dto.msisdn,
			},
			create: {
				msisdn: dto.msisdn,
				source: dto.source,
				status: PhoneNumberStatus.INITIAL,
			},
			update: {},
		});
	}

	async findAll(filter?: PhoneNumberFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.phoneNumber.findMany({
					where: {
						...(filter?.msisdn
							? { msisdn: { contains: filter.msisdn.replace(/[^0-9]/gi, '') } }
							: null),
						...(filter?.source ? { source: filter?.source } : null),
						...(filter?.status ? { status: filter?.status } : null),
					},
					orderBy: [
						{
							msisdn: 'asc',
						},
					],
					take,
					skip,
					cursor: cursor ? { msisdn: cursor } : undefined,
				}),
			(item) => item.msisdn,
			args,
		);
	}

	async findOne(msisdn: string) {
		const num = await this.db.phoneNumber.findUnique({
			where: {
				msisdn,
			},
		});
		if (!num) {
			throw new NotFoundException('phone_number_not_found');
		}
		return num;
	}

	async findActiveBySub(subId: string) {
		return this.db.phoneNumber.findMany({
			where: {
				assignments: {
					some: {
						subscriptionId: subId,
						deletedAt: null,
					},
				},
			},
		});
	}

	async findAssignmentsBySub(subId: string) {
		return this.db.phoneNumberAssignment.findMany({
			where: {
				subscriptionId: subId,
			},
			orderBy: [{ deletedAt: 'desc' }],
		});
	}

	async mapByMsisdns(msisdns: string[]) {
		const phoneNums = await this.db.phoneNumber.findMany({
			where: {
				msisdn: { in: msisdns },
			},
		});
		const map: Map<string, PhoneNumber> = new Map();
		for (const phoneNum of phoneNums) {
			map.set(phoneNum.msisdn, phoneNum);
		}
		return map;
	}

	async mapAssignmentsBySubscriptionPaginated(
		ids: PaginatedLoad<string, PhoneNumberFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT pa.* FROM "PhoneNumberAssignment" AS pa`;
			let where = Prisma.sql`WHERE pa."subscriptionId" = ${id}::uuid`;
			let join = Prisma.sql`LEFT JOIN "PhoneNumber" AS p ON p.msisdn = pa."phoneNumberMsisdn"`;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND p."status"::text = ${filter.status}`;
				}
				if (filter.msisdn) {
					where = Prisma.sql`${where} AND pa."phoneNumberMsisdn" = ${filter.msisdn}`;
				}
				if (filter.source) {
					where = Prisma.sql`${where} AND p."source"::text = ${filter.source}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND pa."createdAt" >= (SELECT "createdAt" FROM "PhoneNumberAssignment" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND pa."createdAt" <= (SELECT "createdAt" FROM "PhoneNumberAssignment" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY pa."createdAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const phoneNumAssignments = await this.db.$queryRaw<
			PhoneNumberAssignment[]
		>`${query}`;

		const map: Map<string, PhoneNumberAssignment[]> = new Map();
		for (const phoneNumAssignment of phoneNumAssignments) {
			let subPhoneNums = map.get(phoneNumAssignment.subscriptionId);
			if (!subPhoneNums) {
				subPhoneNums = [];
				map.set(phoneNumAssignment.subscriptionId, subPhoneNums);
			}
			subPhoneNums.push(phoneNumAssignment);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async changeStatus(msisdn: string, status: PhoneNumberStatus) {
		return this.db.phoneNumber.update({
			where: {
				msisdn,
				status: {
					in: [
						PhoneNumberStatus.INITIAL,
						PhoneNumberStatus.AVAILABLE,
						PhoneNumberStatus.RESERVED,
					],
				},
			},
			data: {
				status,
			},
		});
	}

	async attachToSubscription(
		subId: string,
		isGenerated: boolean,
		msisdn?: string | null,
	) {
		return this.db.$transaction(async (tx: PrismaClient) => {
			if (!msisdn) {
				const freeNum = await tx.phoneNumber.findFirst({
					where: {
						status: PhoneNumberStatus.AVAILABLE,
					},
				});
				if (!freeNum) {
					throw new NotFoundException('no_free_phone_number');
				}
				msisdn = freeNum.msisdn;
			}

			await tx.phoneNumber.updateMany({
				where: {
					assignments: {
						some: {
							OR: [{ subscriptionId: subId }, { phoneNumberMsisdn: msisdn }],
							deletedAt: null,
						},
					},
				},
				data: {
					status: PhoneNumberStatus.RESERVED,
				},
			});

			await tx.phoneNumberAssignment.updateMany({
				where: {
					OR: [{ subscriptionId: subId }, { phoneNumberMsisdn: msisdn }],
					deletedAt: null,
				},
				data: {
					deletedAt: new Date(),
				},
			});

			const num = await tx.phoneNumber.upsert({
				where: {
					msisdn,
				},
				create: {
					msisdn,
					source: isGenerated
						? PhoneNumberSource.GENERATED
						: PhoneNumberSource.IMPORTED,
					status: PhoneNumberStatus.ASSIGNED,
					currentSubscription: {
						connect: {
							id: subId,
						},
					},
					assignments: {
						create: {
							subscriptionId: subId,
						},
					},
				},
				update: {
					status: PhoneNumberStatus.ASSIGNED,
					currentSubscription: {
						connect: {
							id: subId,
						},
					},
					assignments: {
						create: {
							subscriptionId: subId,
						},
					},
				},
			});

			return num;
		});
	}
}

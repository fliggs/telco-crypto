import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	Prisma,
	PrismaClient,
	Sim,
	SimAssignment,
	SimStatus,
	SimType,
} from '@prisma/client';

import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';

import { CreateSimDto } from './dto/request/create-sim.dto';
import { SimFilterDto } from './dto/request/sim-filter.dto';

@Injectable()
export class SimService {
	constructor(private readonly db: DbService) {}

	async getOverview() {
		const countRows = await this.db.sim.groupBy({
			by: ['status'],
			_count: true,
		});

		let total = 0;
		const counts: Record<SimStatus, number> = {
			[SimStatus.INITIAL]: 0,
			[SimStatus.AVAILABLE]: 0,
			[SimStatus.RESERVED]: 0,
			[SimStatus.ASSIGNED]: 0,
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

	async create(dto: CreateSimDto) {
		let iccids: string[] = [];
		if (dto.iccid) {
			iccids.push(dto.iccid);
		} else if (dto.firstIccid && dto.lastIccid) {
			const start = BigInt(dto.firstIccid);
			const end = BigInt(dto.lastIccid);
			for (let iccid = start; iccid <= end; iccid++) {
				iccids.push(iccid.toString());
			}
		} else {
			throw new BadRequestException('iccid_or_range_required');
		}

		await this.db.sim.createMany({
			data: iccids.map((iccid) => ({
				iccid: iccid,
				type: dto.type,
				status: dto.status,
			})),
			skipDuplicates: true,
		});

		return this.db.sim.findMany({
			where: {
				iccid: { in: iccids },
			},
		});
	}

	async findAll(filter?: SimFilterDto, pagination?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.sim.findMany({
					where: {
						...(filter?.iccid
							? { iccid: { contains: filter.iccid.replace(/[^0-9]/gi, '') } }
							: null),
						...(filter?.type ? { type: filter?.type } : null),
						...(filter?.status ? { status: filter?.status } : null),
					},
					orderBy: [
						{
							iccid: 'asc',
						},
					],
					take,
					skip,
					cursor: cursor ? { iccid: cursor } : undefined,
				}),
			(item) => item.iccid,
			pagination,
		);
	}

	async findOne(iccid: string) {
		const sim = await this.db.sim.findUnique({
			where: {
				iccid,
			},
		});
		if (!sim) {
			throw new NotFoundException('sim_not_found');
		}
		return sim;
	}

	async reserveOneFree(type: SimType) {
		return this.db.$transaction(async (tx: PrismaClient) => {
			const sim = await tx.sim.findFirst({
				where: {
					status: SimStatus.AVAILABLE,
					type,
				},
			});

			if (!sim) {
				throw new NotFoundException('no_free_sim_found');
			}

			return tx.sim.update({
				where: {
					iccid: sim.iccid,
				},
				data: {
					status: SimStatus.RESERVED,
				},
			});
		});
	}

	async findOneActiveBySubAndUser(subId: string, userId: string) {
		const sim = await this.db.sim.findFirst({
			where: {
				currentSubscription: {
					id: subId,
					userId,
				},
			},
		});
		if (!sim) {
			throw new NotFoundException('sim_not_found');
		}
		return sim;
	}

	async findOneActiveBySub(subId: string) {
		const sim = await this.db.sim.findFirst({
			where: {
				currentSubscription: {
					id: subId,
				},
			},
		});
		if (!sim) {
			throw new NotFoundException('sim_not_found');
		}
		return sim;
	}

	async findAssignmentsBySub(subId: string) {
		return this.db.simAssignment.findMany({
			where: {
				subscriptionId: subId,
			},
			orderBy: [{ deletedAt: 'desc' }],
		});
	}

	async mapByIccids(iccids: string[]) {
		const sims = await this.db.sim.findMany({
			where: {
				iccid: { in: iccids },
			},
		});
		const map: Map<string, Sim> = new Map();
		for (const sim of sims) {
			map.set(sim.iccid, sim);
		}
		return map;
	}

	async mapAssignmentsBySubscriptionPaginated(
		ids: PaginatedLoad<string, SimFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT sa.* FROM "SimAssignment" AS sa `;
			let where = Prisma.sql`WHERE sa."subscriptionId" = ${id}::uuid`;
			let join = Prisma.sql`LEFT JOIN "Sim" AS s ON s.iccid = sa."simIccid"`;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND s."status"::text = ${filter.status}`;
				}
				if (filter.iccid) {
					where = Prisma.sql`${where} AND sa."simIccid" = ${filter.iccid}`;
				}
				if (filter.type) {
					where = Prisma.sql`${where} AND s."type"::text = ${filter.type}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND sa."createdAt" >= (SELECT "createdAt" FROM "SimAssignment" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND sa."createdAt" <= (SELECT "createdAt" FROM "SimAssignment" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY sa."createdAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const simAssignments = await this.db.$queryRaw<SimAssignment[]>`${query}`;

		const map: Map<string, SimAssignment[]> = new Map();
		for (const simAssignment of simAssignments) {
			let subSims = map.get(simAssignment.subscriptionId);
			if (!subSims) {
				subSims = [];
				map.set(simAssignment.subscriptionId, subSims);
			}
			subSims.push(simAssignment);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async changeStatus(iccid: string, status: SimStatus) {
		return this.db.sim.update({
			where: {
				iccid,
				status: {
					in: [SimStatus.INITIAL, SimStatus.AVAILABLE, SimStatus.RESERVED],
				},
			},
			data: {
				status,
			},
		});
	}

	async attachToSubscription(subId: string, simType: SimType, iccid: string) {
		return this.db.$transaction(async (tx: PrismaClient) => {
			// Mark all currently assigned sims as "RESERVED"
			await tx.sim.updateMany({
				where: {
					assignments: {
						some: {
							OR: [{ subscriptionId: subId }, { simIccid: iccid }],
							deletedAt: null,
						},
					},
				},
				data: {
					status: SimStatus.RESERVED,
				},
			});

			// Mark all current sim assignments as deleted
			await tx.simAssignment.updateMany({
				where: {
					OR: [{ subscriptionId: subId }, { simIccid: iccid }],
					deletedAt: null,
				},
				data: {
					deletedAt: new Date(),
				},
			});

			// Update the SIM into "ASSIGNED" status and create an assignment
			return tx.sim.upsert({
				where: {
					iccid,
					status: { in: [SimStatus.AVAILABLE, SimStatus.RESERVED] },
				},
				create: {
					iccid,
					type: simType,
					status: SimStatus.ASSIGNED,
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
					status: SimStatus.ASSIGNED,
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
		});
	}
}

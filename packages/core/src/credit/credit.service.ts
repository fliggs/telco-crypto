import { Injectable, NotFoundException } from '@nestjs/common';
import { Credit, Prisma, PrismaClient } from '@prisma/client';

import { DbService } from '@/db/db.service';
import { DecimalNumber } from '@/decimal.dto';
import { PaginatedLoad } from '@/paginated';

import { CreditUsageDto } from './dto/internal/credit-usage.dto';
import { CreateCreditDto } from './dto/internal/create-credit.dto';
import { CreditFilterDto } from './dto/request/credit-filter.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class CreditService {
	constructor(private readonly db: DbService) {}

	async create(dto: CreateCreditDto) {
		return this.db.credit.create({
			data: {
				userId: dto.userId,
				subscriptionId: dto.subscriptionId,
				providedCost: dto.providedCost,
				usedCost: new DecimalNumber(0),
				content: {
					title: dto.title,
				},
			},
		});
	}

	async findByUser(userId: string) {
		return this.db.credit.findMany({
			where: {
				userId,
			},
		});
	}

	async findUnusedByUserAndSubscription(userId: string, subId: string | null) {
		return this.db.credit.findMany({
			where: {
				userId,
				usedCost: {
					lt: this.db.credit.fields.providedCost,
				},
				OR: [{ subscriptionId: subId }, { subscriptionId: null }],
			},
		});
	}

	async mapByUserIdsPaginated(ids: PaginatedLoad<string, CreditFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT c.* FROM "Credit" AS c`;
			let where = Prisma.sql`WHERE c."userId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.usedCost) {
					where = Prisma.sql`${where} AND c."usedCost" >= ${filter.usedCost}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND c."updatedAt" >= (SELECT "updatedAt" FROM "Credit" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND c."updatedAt" <= (SELECT "updatedAt" FROM "Credit" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY c."updatedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const credits = await this.db.$queryRaw<Credit[]>`${query}`;

		const map: Map<string, Credit[]> = new Map();
		for (const credit of credits) {
			let userCredits = map.get(credit.userId);
			if (!userCredits) {
				userCredits = [];
				map.set(credit.userId, userCredits);
			}
			userCredits.push(credit);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async useCredits(usages: CreditUsageDto[], tx: PrismaClient) {
		await tx.creditUsage.createMany({
			data: usages.map((usage) => ({
				orderId: usage.orderId,
				creditId: usage.creditId,
				usedCost: usage.usedCost,
				invoiceId: usage.invoiceId,
			})),
		});

		for (const usage of usages) {
			await tx.credit.update({
				where: {
					id: usage.creditId,
					usedCost: usage.oldUsedCost, // This check is here to prevent concurrency issues
				},
				data: {
					usedCost: {
						increment: usage.usedCost,
					},
				},
			});
		}
	}

	async computeUserCreditBalance(userId: string): Promise<Decimal> {
		const userExists = await this.db.user.findUnique({
			where: { id: userId },
			select: { id: true }, 
		});

		if (!userExists) {
			throw new NotFoundException('user_not_found');
		}
		const result = await this.db.credit.aggregate({
			where: { userId },
			_sum: {
				providedCost: true,
				usedCost: true,
			},
		});

		const provided = result._sum.providedCost ?? new Prisma.Decimal(0);
		const used = result._sum.usedCost ?? new Prisma.Decimal(0);

		return provided.sub(used);
	}
}

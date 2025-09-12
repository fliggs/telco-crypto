import { Injectable, Logger } from '@nestjs/common';
import { Prisma, RewardPayout } from '@prisma/client';

import { PaginatedLoad } from '@/paginated';
import { DbService } from '@/db/db.service';

@Injectable()
export class RewardPayoutService {
	protected readonly logger = new Logger(RewardPayoutService.name);

	constructor(private readonly db: DbService) {}

	async mapByRewardIdsPaginated(ids: PaginatedLoad<string, null>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT p.* FROM "RewardPayout" AS p `;
			let where = Prisma.sql`WHERE p."rewardId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				// NO-OP
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND p."createdAt" >= (SELECT "createdAt" FROM "RewardPayout" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND p."createdAt" <= (SELECT "createdAt" FROM "RewardPayout" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY p."createdAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const payouts = await this.db.$queryRaw<RewardPayout[]>`${query}`;

		const map: Map<string, RewardPayout[]> = new Map();
		for (const payout of payouts) {
			let rewardPayouts = map.get(payout.rewardId);
			if (!rewardPayouts) {
				rewardPayouts = [];
				map.set(payout.rewardId, rewardPayouts);
			}
			rewardPayouts.push(payout);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}
}

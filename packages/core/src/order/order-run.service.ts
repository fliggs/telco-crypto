import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderRun } from '@prisma/client';

import { DbService } from '@/db/db.service';

@Injectable()
export class OrderRunService {
	protected readonly logger = new Logger(OrderRunService.name);

	constructor(private readonly db: DbService) {}

	async findOne(id: string) {
		const run = await this.db.orderRun.findUnique({
			where: {
				id,
			},
		});
		if (!run) {
			throw new NotFoundException('order_run_not_found');
		}
		return run;
	}

	async mapByOrderId(ids: string[]) {
		const runs = await this.db.orderRun.findMany({
			where: {
				orderId: { in: ids },
			},
			orderBy: [
				{
					orderId: 'asc',
				},
				{
					updatedAt: 'desc',
				},
			],
		});
		const map: Map<string, OrderRun[]> = new Map();
		for (const run of runs) {
			let orderRuns = map.get(run.orderId);
			if (!orderRuns) {
				orderRuns = [];
				map.set(run.orderId, orderRuns);
			}
			orderRuns.push(run);
		}
		return map;
	}

	async mapNewestByOrderId(ids: string[]) {
		// TODO: Maybe we can improve this query
		const grouped = await this.db.orderRun.groupBy({
			where: {
				orderId: { in: ids },
			},
			by: ['orderId'],
			_max: { updatedAt: true },
			orderBy: [{ _max: { updatedAt: 'desc' } }],
		});
		const runs = await this.db.orderRun.findMany({
			where: {
				OR: grouped.map((g) => ({
					orderId: g.orderId,
					updatedAt: g._max.updatedAt!,
				})),
			},
		});
		const map: Map<string, OrderRun> = new Map();
		for (const run of runs) {
			map.set(run.orderId, run);
		}
		return map;
	}
}

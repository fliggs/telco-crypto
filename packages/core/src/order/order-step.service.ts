import { Injectable, Logger } from '@nestjs/common';
import { OrderStep } from '@prisma/client';

import { DbService } from '@/db/db.service';

@Injectable()
export class OrderStepService {
	protected readonly logger = new Logger(OrderStepService.name);

	constructor(private readonly db: DbService) {}

	async mapByOrderIds(ids: string[]) {
		const steps = await this.db.orderStep.findMany({
			where: {
				orderId: { in: ids },
			},
			orderBy: [
				{
					orderId: 'asc',
				},
				{
					stepNo: 'asc',
				},
			],
		});
		const map: Map<string, OrderStep[]> = new Map();
		for (const step of steps) {
			let orderSteps = map.get(step.orderId);
			if (!orderSteps) {
				orderSteps = [];
				map.set(step.orderId, orderSteps);
			}
			orderSteps.push(step);
		}
		return map;
	}

	async mapCurrentByOrderIds(ids: [string, number][]) {
		const steps = await this.db.orderStep.findMany({
			where: {
				OR: ids.map(([orderId, stepNo]) => ({ orderId, stepNo })),
			},
		});
		const map: Map<string, OrderStep> = new Map();
		for (const step of steps) {
			map.set(step.orderId, step);
		}
		return map;
	}
}

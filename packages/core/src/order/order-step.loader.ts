import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { OrderRun, OrderStep } from '@prisma/client';

import { OrderStepService } from './order-step.service';

@Injectable({ scope: Scope.REQUEST })
export class OrderStepLoader {
	constructor(private readonly orderStepService: OrderStepService) {}

	public readonly byOrderId = new DataLoader<string, OrderStep[]>(
		async (keys: readonly string[]) => {
			const map = await this.orderStepService.mapByOrderIds([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);

	public readonly currentByOrderId = new DataLoader<
		[string, number],
		OrderStep | null
	>(async (keys: readonly [string, number][]) => {
		const map = await this.orderStepService.mapCurrentByOrderIds([...keys]);
		return keys.map((key) => map.get(key[0]) ?? null);
	});
}

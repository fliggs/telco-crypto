import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { OrderRun, OrderRunStep } from '@prisma/client';

import { OrderRunStepService } from './order-run-step.service';

@Injectable({ scope: Scope.REQUEST })
export class OrderRunStepLoader {
	constructor(private readonly orderRunStepService: OrderRunStepService) {}

	public readonly byRunId = new DataLoader<string, OrderRunStep[]>(
		async (keys: readonly string[]) => {
			const map = await this.orderRunStepService.mapByRunId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);

	public readonly currentByRunId = new DataLoader<
		[string, number],
		OrderRunStep | null
	>(async (keys: readonly [string, number][]) => {
		const map = await this.orderRunStepService.mapCurrentByRunId([...keys]);
		return keys.map((key) => map.get(key[0]) ?? null);
	});
}

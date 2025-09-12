import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { OrderRun } from '@prisma/client';

import { OrderRunService } from './order-run.service';

@Injectable({ scope: Scope.REQUEST })
export class OrderRunLoader {
	constructor(private readonly orderRunService: OrderRunService) {}

	public readonly byOrderId = new DataLoader<string, OrderRun[]>(
		async (keys: readonly string[]) => {
			const map = await this.orderRunService.mapByOrderId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);

	public readonly newestByOrderId = new DataLoader<string, OrderRun | null>(
		async (keys: readonly string[]) => {
			const map = await this.orderRunService.mapNewestByOrderId([...keys]);
			return keys.map((key) => map.get(key) ?? null);
		},
	);
}

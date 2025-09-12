import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { UserBillingData } from '@prisma/client';

import { BillingService } from './billing.service';

@Injectable({ scope: Scope.REQUEST })
export class BillingLoader {
	constructor(private readonly billingService: BillingService) {}

	public readonly userDataByUser = new DataLoader<string, UserBillingData[]>(
		async (keys: readonly string[]) => {
			const map = await this.billingService.mapUserDataByUserId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);
}

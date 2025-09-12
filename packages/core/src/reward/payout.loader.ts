import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { RewardPayout } from '@prisma/client';

import { PaginatedLoad } from '@/paginated';

import { RewardPayoutService } from './payout.service';

@Injectable({ scope: Scope.REQUEST })
export class RewardPayoutLoader {
	constructor(private readonly rewardPayoutService: RewardPayoutService) {}

	public readonly payoutsByRewardPaginated = new DataLoader<
		PaginatedLoad<string, null>,
		RewardPayout[]
	>(async (keys: readonly PaginatedLoad<string, null>[]) => {
		const map = await this.rewardPayoutService.mapByRewardIdsPaginated([
			...keys,
		]);
		return keys.map(([key]) => map.get(key) ?? []);
	});
}

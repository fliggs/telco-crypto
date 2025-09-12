import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { Reward } from '@prisma/client';

import { PaginatedLoad } from '@/paginated';

import { RewardService } from './reward.service';
import { RewardFilterDto } from './dto/request/filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class RewardLoader {
	constructor(private readonly rewardService: RewardService) {}

	public readonly byOfferPaginated = new DataLoader<
		PaginatedLoad<string, RewardFilterDto>,
		Reward[]
	>(async (keys: readonly PaginatedLoad<string, RewardFilterDto>[]) => {
		const map = await this.rewardService.mapByOfferIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});
}

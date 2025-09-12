import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Reward } from '@prisma/client';

import { paginate, PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { PaginatedOffers } from '@/offer/dto/graphql/offer.dto';
import { OfferFilterDto } from '@/offer/dto/request/filter.dto';
import { OfferLoader } from '@/offer/offer.loader';

import { RewardService } from './reward.service';
import { PaginatedRewards, RewardDto } from './dto/graphql/reward.dto';
import { RewardFilterDto } from './dto/request/filter.dto';
import { CreateRewardDto } from './dto/request/create.dto';
import { PaginatedRewardPayouts } from './dto/graphql/payout.dto';
import { RewardPayoutLoader } from './payout.loader';

@Resolver(RewardDto)
export class RewardResolver {
	constructor(
		private readonly rewardService: RewardService,
		private readonly payoutLoader: RewardPayoutLoader,
		private readonly offerLoader: OfferLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedRewards)
	async rewards(
		@Args('filter', { type: () => RewardFilterDto, nullable: true })
		filter?: RewardFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedRewards> {
		return this.rewardService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Query(() => RewardDto)
	async reward(@Args('id') id: string): Promise<RewardDto> {
		return this.rewardService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => RewardDto)
	async createReward(
		@Args('reward', { type: () => CreateRewardDto })
		dto: CreateRewardDto,
	): Promise<RewardDto> {
		return this.rewardService.create(dto);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedOffers)
	async offers(
		@Parent() reward: Reward,
		@Args('filter', { type: () => OfferFilterDto, nullable: true })
		filter?: OfferFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOffers> {
		return paginate(
			(take, skip, cursor) =>
				this.offerLoader.byRewardPaginated.load([
					reward.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}

	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() reward: Reward): Promise<string> {
		return JSON.stringify(reward.data);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedRewardPayouts)
	async payouts(
		@Parent() reward: Reward,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedRewardPayouts> {
		return paginate(
			(take, skip, cursor) =>
				this.payoutLoader.payoutsByRewardPaginated.load([
					reward.id,
					null,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}
}

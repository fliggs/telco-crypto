import {
	Args,
	Int,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Offer } from '@prisma/client';

import { paginate, PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { OfferDto, PaginatedOffers } from '@/offer/dto/graphql/offer.dto';
import { PlanDto } from '@/plan/dto/graphql/plan.dto';
import { PlanLoader } from '@/plan/plan.loader';
import { PaginatedRewards } from '@/reward/dto/graphql/reward.dto';
import { RewardLoader } from '@/reward/reward.loader';
import { RewardFilterDto } from '@/reward/dto/request/filter.dto';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';

import { OfferService } from './offer.service';
import { OfferLoader } from './offer.loader';
import { CreateOfferDto } from './dto/request/create-offer.dto';
import { OfferFilterDto } from './dto/request/filter.dto';

@Resolver(() => OfferDto)
export class OfferResolver {
	constructor(
		private readonly offerService: OfferService,
		private readonly offerLoader: OfferLoader,
		private readonly planLoader: PlanLoader,
		private readonly rewardLoader: RewardLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedOffers)
	async offers(
		@Args('filter', { type: () => OfferFilterDto, nullable: true })
		filter?: OfferFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOffers> {
		return this.offerService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Mutation(() => OfferDto)
	async createOffer(
		@Args('name', { type: () => String })
		name: string,
		@Args('offer', { type: () => CreateOfferDto })
		dto: CreateOfferDto,
	): Promise<OfferDto> {
		return this.offerService.dynamicCreate(name, dto);
	}

	@AdminAccess()
	@Mutation(() => OfferDto)
	async updateOffer(
		@Args('id', { type: () => String })
		id: string,
		@Args('legalId', { type: () => String, nullable: true })
		legalId: string,
		@Args('isPublic', { type: () => Boolean, nullable: true })
		isPublic: boolean,
		@Args('isActive', { type: () => Boolean, nullable: true })
		isActive: boolean,
		@Args('sort', { type: () => Int, nullable: true })
		sort: number,
		@Args('content', { type: () => ContentInputDto, nullable: true })
		content: ContentInputDto,
	): Promise<OfferDto> {
		return this.offerService.update(id, {
			legalId,
			isPublic,
			isActive,
			sort,
			content,
		});
	}

	@AdminAccess()
	@Query(() => OfferDto)
	async offer(
		@Args('id', { type: () => String }) id: string,
	): Promise<OfferDto> {
		return this.offerService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => Boolean)
	async linkOffers(
		@Args('parentId', { type: () => String })
		parentId: string,
		@Args('childId', { type: () => String })
		childId: string,
	): Promise<boolean> {
		await this.offerService.link(parentId, childId);
		return true;
	}

	@AdminAccess()
	@Mutation(() => Boolean)
	async unlinkOffers(
		@Args('parentId', { type: () => String })
		parentId: string,
		@Args('childId', { type: () => String })
		childId: string,
	): Promise<boolean> {
		await this.offerService.unlink(parentId, childId);
		return true;
	}

	@AdminAccess()
	@ResolveField(() => PlanDto)
	async plan(@Parent() offer: Offer): Promise<PlanDto> {
		return this.planLoader.byId.load(offer.planId);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedRewards)
	async rewards(
		@Parent() offer: Offer,
		@Args('filter', { type: () => RewardFilterDto, nullable: true })
		filter?: RewardFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedRewards> {
		return paginate(
			(take, skip, cursor) =>
				this.rewardLoader.byOfferPaginated.load([
					offer.id,
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
	@ResolveField(() => PaginatedOffers)
	async parents(
		@Parent() offer: Offer,
		@Args('filter', { type: () => OfferFilterDto, nullable: true })
		filter?: OfferFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOffers> {
		return paginate(
			(take, skip, cursor) =>
				this.offerLoader.parentsByOfferPaginated.load([
					offer.id,
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
	@ResolveField(() => PaginatedOffers)
	async children(
		@Parent() offer: Offer,
		@Args('filter', { type: () => OfferFilterDto, nullable: true })
		filter?: OfferFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOffers> {
		return paginate(
			(take, skip, cursor) =>
				this.offerLoader.childrenByOfferPaginated.load([
					offer.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}
}

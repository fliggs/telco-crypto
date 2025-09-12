import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Sim, SimStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

import { PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { TelcoService } from '@/telco/telco.service';
import { SubscriptionDto } from '@/subscription/dto/graphql/subscription.dto';
import { SubscriptionLoader } from '@/subscription/subscription.loader';
import { VolumeUsageDto } from '@/volume/dto/graphql/volume-usage.dto';
import { SubscriptionService } from '@/subscription/subscription.service';

import { SimService } from './sim.service';
import { PaginatedSims, SimDto } from './dto/graphql/sim.dto';
import { SimFilterDto } from './dto/request/sim-filter.dto';
import { SimOverviewDto } from './dto/graphql/sim-overview.dto';
import { CreateSimDto } from './dto/request/create-sim.dto';
import { SimDetailsDto } from './dto/graphql/sim-details.dto';

@Resolver(() => SimDto)
export class SimResolver {
	constructor(
		private readonly simService: SimService,
		private readonly subLoader: SubscriptionLoader,
		private readonly telcoService: TelcoService,
		private readonly subService: SubscriptionService,
	) {}

	@AdminAccess()
	@Query(() => PaginatedSims)
	async sims(
		@Args('filter', { type: () => SimFilterDto, nullable: true })
		filter?: SimFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedSims> {
		return this.simService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Query(() => SimDto)
	async sim(@Args('iccid') iccid: string) {
		return this.simService.findOne(iccid);
	}

	@AdminAccess()
	@Query(() => SimOverviewDto)
	async simOverview(): Promise<SimOverviewDto> {
		return this.simService.getOverview();
	}

	@AdminAccess()
	@Query(() => SimDetailsDto)
	async simDetails(
		@Args('iccid', { type: () => String }) iccid: string,
	): Promise<SimDetailsDto> {
		const sim = await this.simService.findOne(iccid);
		return this.telcoService.getSimDetails({ type: sim.type, iccid });
	}

	@AdminAccess()
	@Query(() => [VolumeUsageDto])
	async simUsage(
		@Args('iccid', { type: () => String }) iccid: string,
	): Promise<VolumeUsageDto[]> {
		const sub =
			await this.subService.findOneBySimWithOfferAndPlanAndVolumes(iccid);
		if (!sub) {
			throw new BadRequestException('no_subscription_found');
		}

		const childSubs =
			await this.subService.findChildrenWithOfferAndPlanAndVolumes(sub.id);

		return this.telcoService.getSubscriptionUsage(sub, childSubs);
	}

	@AdminAccess()
	@Mutation(() => [SimDto])
	async createSim(
		@Args('sim', { type: () => CreateSimDto })
		dto: CreateSimDto,
	): Promise<SimDto[]> {
		return this.simService.create(dto);
	}

	@AdminAccess()
	@Mutation(() => SimDto)
	async changeSimStatus(
		@Args('iccid', { type: () => String })
		iccid: string,
		@Args('status', { type: () => SimStatus })
		status: SimStatus,
	): Promise<SimDto> {
		return this.simService.changeStatus(iccid, status);
	}

	@AdminAccess()
	@ResolveField(() => SubscriptionDto, { nullable: true })
	async currentSubscription(
		@Parent() sim: Sim,
	): Promise<SubscriptionDto | null> {
		return this.subLoader.byCurrentSim.load(sim.iccid);
	}
}

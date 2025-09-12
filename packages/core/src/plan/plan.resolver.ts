import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Plan } from '@prisma/client';

import { paginate, PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { VolumeLoader } from '@/volume/volume.loader';
import { VolumeDto } from '@/volume/dto/graphql/volume.dto';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';

import { PlanService } from './plan.service';
import { PaginatedPlans, PlanDto } from './dto/graphql/plan.dto';
import { PlanLoader } from './plan.loader';
import { PlanTaxDataDto } from './dto/graphql/plan-tax-data.dto';
import { PlanTelcoDataDto } from './dto/graphql/plan-telco-data.dto';
import { CreatePlanDto } from './dto/request/create-plan.dto';
import { PlanTelcoDataInputDto } from './dto/request/plan-telco-data-input.dto';
import { PlanTaxDataInputDto } from './dto/request/plan-tax-data-input.dto';
import { PlanFilterDto } from './dto/request/plan-filter.dto';

@Resolver(() => PlanDto)
export class PlanResolver {
	constructor(
		private readonly planService: PlanService,
		private readonly planLoader: PlanLoader,
		private readonly volumeLoader: VolumeLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedPlans)
	async plans(
		@Args('filter', { type: () => PlanFilterDto, nullable: true })
		filter?: PlanFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedPlans> {
		return this.planService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Query(() => PlanDto)
	async plan(@Args('id', { type: () => String }) id: string): Promise<PlanDto> {
		return this.planService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => PlanDto)
	async createPlan(
		@Args('name', { type: () => String })
		name: string,
		@Args('plan', { type: () => CreatePlanDto })
		dto: CreatePlanDto,
		@Args('telco', { type: () => [PlanTelcoDataInputDto], nullable: true })
		telcoData: PlanTelcoDataInputDto[],
		@Args('tax', { type: () => [PlanTaxDataInputDto], nullable: true })
		taxData: PlanTaxDataInputDto[],
	): Promise<PlanDto> {
		return this.planService.dynamicCreate(name, dto, telcoData, taxData);
	}

	@AdminAccess()
	@Mutation(() => PlanDto)
	async updatePlan(
		@Args('id', { type: () => String })
		id: string,
		@Args('content', { type: () => ContentInputDto, nullable: true })
		content: ContentInputDto,
	): Promise<PlanDto> {
		return this.planService.update(id, { content });
	}

	@AdminAccess()
	@Mutation(() => Boolean)
	async linkPlans(
		@Args('parentId', { type: () => String })
		parentId: string,
		@Args('childId', { type: () => String })
		childId: string,
	): Promise<boolean> {
		await this.planService.link(parentId, childId);
		return true;
	}

	@AdminAccess()
	@Mutation(() => Boolean)
	async unlinkPlans(
		@Args('parentId', { type: () => String })
		parentId: string,
		@Args('childId', { type: () => String })
		childId: string,
	): Promise<boolean> {
		await this.planService.unlink(parentId, childId);
		return true;
	}

	@AdminAccess()
	@ResolveField(() => [VolumeDto])
	async volumes(@Parent() plan: Plan): Promise<VolumeDto[]> {
		return this.volumeLoader.byPlan.load(plan.id);
	}

	@AdminAccess()
	@ResolveField(() => [PlanDto])
	async versions(@Parent() plan: Plan): Promise<PlanDto[]> {
		return this.planLoader.byName.load(plan.name);
	}

	@AdminAccess()
	@ResolveField(() => [PlanTelcoDataDto])
	async telcoData(@Parent() plan: Plan): Promise<PlanTelcoDataDto[]> {
		return this.planLoader.telcoDataByPlanId.load(plan.id);
	}

	@AdminAccess()
	@ResolveField(() => [PlanTaxDataDto])
	async taxData(@Parent() plan: Plan): Promise<PlanTaxDataDto[]> {
		return this.planLoader.taxDataByPlanId.load(plan.id);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedPlans)
	async parents(
		@Parent() plan: Plan,
		@Args('filter', { type: () => PlanFilterDto, nullable: true })
		filter?: PlanFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedPlans> {
		return paginate(
			(take, skip, cursor) =>
				this.planLoader.parentsByPlanPaginated.load([
					plan.id,
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
	@ResolveField(() => PaginatedPlans)
	async children(
		@Parent() plan: Plan,
		@Args('filter', { type: () => PlanFilterDto, nullable: true })
		filter?: PlanFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedPlans> {
		return paginate(
			(take, skip, cursor) =>
				this.planLoader.childrenByPlanPaginated.load([
					plan.id,
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

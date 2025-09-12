import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Plan, PlanTaxData, PlanTelcoData } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { PlanService } from './plan.service';
import { PaginatedLoad } from '@/paginated';
import { PlanFilterDto } from './dto/request/plan-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class PlanLoader {
	constructor(@Inject() private readonly planService: PlanService) {}

	public readonly byId = new DataLoader<string, Plan>(
		async (keys: readonly string[]) => {
			const map = await this.planService.mapByIds([...keys]);
			return keys.map(
				(key) => map.get(key) ?? new NotFoundException('plan_not_found'),
			);
		},
	);

	public readonly byName = new DataLoader<string, Plan[]>(
		async (keys: readonly string[]) => {
			const map = await this.planService.mapByName([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);

	public readonly parentsByPlanPaginated = new DataLoader<
		PaginatedLoad<string, PlanFilterDto>,
		Plan[]
	>(async (keys: readonly PaginatedLoad<string, PlanFilterDto>[]) => {
		const map = await this.planService.mapParentsByPlanIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly childrenByPlanPaginated = new DataLoader<
		PaginatedLoad<string, PlanFilterDto>,
		Plan[]
	>(async (keys: readonly PaginatedLoad<string, PlanFilterDto>[]) => {
		const map = await this.planService.mapChildrenByPlanIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly telcoDataByPlanId = new DataLoader<string, PlanTelcoData[]>(
		async (keys: readonly string[]) => {
			const map = await this.planService.mapTelcoDataByPlanId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);

	public readonly taxDataByPlanId = new DataLoader<string, PlanTaxData[]>(
		async (keys: readonly string[]) => {
			const map = await this.planService.mapTaxDataByPlanId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);
}

import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Sim, SimAssignment } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { PaginatedLoad } from '@/paginated';

import { SimService } from './sim.service';
import { SimFilterDto } from './dto/request/sim-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class SimLoader {
	constructor(private readonly simService: SimService) {}

	public readonly byIccid = new DataLoader<string, Sim>(
		async (keys: readonly string[]) => {
			const map = await this.simService.mapByIccids([...keys]);
			return keys.map(
				(key) => map.get(key) ?? new NotFoundException('sim_not_found'),
			);
		},
	);

	public readonly assignmentsBySubscriptionPaginated = new DataLoader<
		PaginatedLoad<string, SimFilterDto>,
		SimAssignment[]
	>(async (keys: readonly PaginatedLoad<string, SimFilterDto>[]) => {
		const map = await this.simService.mapAssignmentsBySubscriptionPaginated([
			...keys,
		]);
		return keys.map(([key]) => map.get(key) ?? []);
	});
}

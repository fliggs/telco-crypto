import { Inject, Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';

import { VolumeService } from './volume.service';
import { VolumeDto } from './dto/graphql/volume.dto';

@Injectable({ scope: Scope.REQUEST })
export class VolumeLoader {
	constructor(@Inject() private readonly volService: VolumeService) {}

	public readonly byPlan = new DataLoader<string, VolumeDto[]>(
		async (keys: readonly string[]) => {
			const map = await this.volService.mapByPlanIds([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);
}

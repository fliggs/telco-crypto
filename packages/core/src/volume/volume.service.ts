import { Injectable } from '@nestjs/common';
import { Volume } from '@prisma/client';

import { DbService } from '@/db/db.service';

@Injectable()
export class VolumeService {
	constructor(private readonly db: DbService) {}

	async mapByPlanIds(ids: string[]) {
		const volumes = await this.db.volume.findMany({
			where: {
				planId: { in: ids },
			},
		});
		const map: Map<string, Volume[]> = new Map();
		for (const vol of volumes) {
			let planVols = map.get(vol.planId);
			if (!planVols) {
				planVols = [];
				map.set(vol.planId, planVols);
			}
			planVols.push(vol);
		}
		return map;
	}
}

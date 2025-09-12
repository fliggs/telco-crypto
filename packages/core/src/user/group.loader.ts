import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { User, UserGroup } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { UserGroupService } from './group.service';

@Injectable({ scope: Scope.REQUEST })
export class UserGroupLoader {
	constructor(private readonly groupService: UserGroupService) {}

	public readonly byId = new DataLoader<string, UserGroup | null>(
		async (keys: readonly string[]) => {
			const map = await this.groupService.mapByIds([...keys]);
			return keys.map((key) => map.get(key) ?? null);
		},
	);
}

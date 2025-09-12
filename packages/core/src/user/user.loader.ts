import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { User } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { UserService } from './user.service';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
	constructor(private readonly userService: UserService) {}

	public readonly byId = new DataLoader<string, User>(
		async (keys: readonly string[]) => {
			const map = await this.userService.mapByIds([...keys]);
			return keys.map(
				(key) => map.get(key) ?? new NotFoundException('user_not_found'),
			);
		},
	);
}

import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { AdminAuthData, UserAuthData } from '@prisma/client';

import { AuthService } from './auth.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthLoader {
	constructor(private readonly authService: AuthService) {}

	public readonly userDataByUser = new DataLoader<string, UserAuthData[]>(
		async (keys: readonly string[]) => {
			const map = await this.authService.mapUserDataByUserId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);

	public readonly adminDataByAdmin = new DataLoader<string, AdminAuthData[]>(
		async (keys: readonly string[]) => {
			const map = await this.authService.mapAdminDataByAdminId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);
}

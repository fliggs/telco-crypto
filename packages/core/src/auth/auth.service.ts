import { Injectable } from '@nestjs/common';
import { AdminAuthData, UserAuthData } from '@prisma/client';

import { DbService } from '@/db/db.service';

@Injectable()
export class AuthService {
	constructor(private readonly db: DbService) {}

	async findUserDataByUser(userId: string) {
		return this.db.userAuthData.findMany({
			where: {
				userId,
			},
		});
	}

	async mapUserDataByUserId(ids: string[]) {
		const allData = await this.db.userAuthData.findMany({
			where: {
				userId: { in: ids },
			},
		});
		const map: Map<string, UserAuthData[]> = new Map();
		for (const data of allData) {
			let userData = map.get(data.userId);
			if (!userData) {
				userData = [];
				map.set(data.userId, userData);
			}
			userData.push(data);
		}
		return map;
	}

	async mapAdminDataByAdminId(ids: string[]) {
		const allData = await this.db.adminAuthData.findMany({
			where: {
				adminId: { in: ids },
			},
		});
		const map: Map<string, AdminAuthData[]> = new Map();
		for (const data of allData) {
			let adminData = map.get(data.adminId);
			if (!adminData) {
				adminData = [];
				map.set(data.adminId, adminData);
			}
			adminData.push(data);
		}
		return map;
	}
}

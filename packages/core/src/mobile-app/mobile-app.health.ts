import { Injectable } from '@nestjs/common';
import { SettingKey } from '@prisma/client';
import {
	HealthIndicatorResult,
	HealthIndicatorService,
} from '@nestjs/terminus';

import { DbService } from '@/db/db.service';

@Injectable()
export class MobileAppHealthIndicator {
	constructor(
		private readonly db: DbService,
		private readonly healthIndicatorService: HealthIndicatorService,
	) {}

	async checkVersion(key: string): Promise<HealthIndicatorResult> {
		const indicator = this.healthIndicatorService.check(key);

		const app = await this.db.setting.findUnique({
			where: {
				key: SettingKey.MOBILE_APP,
			},
		});
		if (!app || !app.value) {
			return indicator.down('missing_mobile_app_config');
		}

		// TODO: Proper typing
		const appData = app.value as any;

		return indicator.up({
			minVersion: {
				ios: appData.iosMinVersion,
				android: appData.androidMinVersion,
			},
		});
	}
}

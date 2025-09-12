import { Injectable } from '@nestjs/common';
import {
	HealthIndicatorResult,
	HealthIndicatorService,
} from '@nestjs/terminus';

import { DbService } from './db.service';

@Injectable()
export class DbHealthIndicator {
	constructor(
		private readonly db: DbService,
		private readonly healthIndicatorService: HealthIndicatorService,
	) {}

	async checkConnection(key: string): Promise<HealthIndicatorResult> {
		const indicator = this.healthIndicatorService.check(key);

		const isHealthy = await this.db.$queryRaw`SELECT 1`
			.then(() => true)
			.catch(() => false);

		return isHealthy ? indicator.up() : indicator.down();
	}
}

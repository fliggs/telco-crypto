import { Controller, Get, SerializeOptions } from '@nestjs/common';
import {
	HealthCheckService,
	HttpHealthIndicator,
	HealthCheck,
	DiskHealthIndicator,
	MemoryHealthIndicator,
} from '@nestjs/terminus';

import { DbHealthIndicator } from '@/db/db.health';
import { PublicAccess } from '@/auth/access.decorator';
import { MobileAppHealthIndicator } from '@/mobile-app/mobile-app.health';

@Controller({
	path: 'health',
	version: '1',
})
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly http: HttpHealthIndicator,
		private readonly disk: DiskHealthIndicator,
		private readonly memory: MemoryHealthIndicator,
		private readonly dbHealth: DbHealthIndicator,
		private readonly app: MobileAppHealthIndicator,
	) {}

	@Get()
	@HealthCheck()
	@SerializeOptions({ strategy: 'exposeAll' })
	@PublicAccess()
	async check() {
		return this.health.check([
			() => this.http.pingCheck('network', 'https://cloudflare.com'),
			() =>
				this.disk.checkStorage('storage', {
					path: '/',
					thresholdPercent: 0.95,
				}),
			() => this.memory.checkHeap('memory', 150 * 1024 * 1024),
			() => this.dbHealth.checkConnection('db'),
			() => this.app.checkVersion('mobile_app'),
		]);
	}
}

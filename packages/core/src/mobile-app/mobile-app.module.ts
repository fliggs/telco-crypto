import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DbModule } from '@/db/db.module';

import { MobileAppHealthIndicator } from './mobile-app.health';

@Global()
@Module({
	imports: [DbModule, TerminusModule],
	providers: [MobileAppHealthIndicator],
	exports: [MobileAppHealthIndicator],
})
export class MobileAppModule {}

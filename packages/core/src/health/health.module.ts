import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';

import { MobileAppModule } from '@/mobile-app/mobile-app.module';

import { HealthController } from './health.controller';
import { HealthResolver } from './health.resolver';

@Module({
	imports: [TerminusModule, HttpModule, MobileAppModule],
	providers: [HealthResolver],
	controllers: [HealthController],
})
export class HealthModule {}

import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DbService } from './db.service';
import { DbHealthIndicator } from './db.health';

@Global()
@Module({
	imports: [TerminusModule],
	providers: [DbService, DbHealthIndicator],
	exports: [DbService, DbHealthIndicator],
})
export class DbModule {}

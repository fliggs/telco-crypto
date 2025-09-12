import { Module } from '@nestjs/common';

import { LogService } from './log.service';
import { LogResolver } from './log.resolver';

@Module({
	providers: [LogService, LogResolver],
	controllers: [],
	exports: [LogService],
})
export class LogModule {}

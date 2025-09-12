import { Module } from '@nestjs/common';

import { CreditService } from './credit.service';
import { CreditLoader } from './credit.loader';
import { CreditResolver } from './credit.resolver';

@Module({
	providers: [CreditService, CreditResolver, CreditLoader],
	controllers: [],
	exports: [CreditService, CreditLoader],
})
export class CreditModule {}

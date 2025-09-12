import {
	forwardRef,
	InternalServerErrorException,
	Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DbService } from '@/db/db.service';
import { UserModule } from '@/user/user.module';

import { BillingLoader } from './billing.loader';
import { BillingService } from './billing.service';
import { UserBillingDataResolver } from './user-billing-data.resolver';
import { BillingMockService } from './implementations/mock/mock.service';
import { BillingMockController } from './implementations/mock/mock.controller';

@Module({
	imports: [forwardRef(() => UserModule)],
	providers: [
		{
			provide: BillingService,
			useFactory: (config: ConfigService, db: DbService) => {
				const provider = config.getOrThrow<string>('BILLING_PROVIDER');
				switch (provider) {
					case 'mock':
						return new BillingMockService(config, db);

					default:
						throw new InternalServerErrorException('invalid_billing_provider');
				}
			},
			inject: [ConfigService, DbService],
		},
		BillingLoader,
		UserBillingDataResolver,
	],
	controllers: [BillingMockController],
	exports: [BillingService, BillingLoader],
})
export class BillingModule {}

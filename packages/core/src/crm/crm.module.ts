import {
	forwardRef,
	InternalServerErrorException,
	Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserModule } from '@/user/user.module';
import { UserService } from '@/user/user.service';
import { SubscriptionModule } from '@/subscription/subscription.module';
import { SubscriptionService } from '@/subscription/subscription.service';

import { CrmService } from './crm.service';
import { CrmMockService } from './implementations/mock/mock.service';

@Module({
	imports: [forwardRef(() => UserModule), forwardRef(() => SubscriptionModule)],
	providers: [
		{
			provide: CrmService,
			useFactory: (
				config: ConfigService,
				userService: UserService,
				subService: SubscriptionService,
			) => {
				const provider = config.getOrThrow<string>('CRM_PROVIDER');
				switch (provider) {
					case 'mock':
						return new CrmMockService(config, userService, subService);

					default:
						throw new InternalServerErrorException('invalid_crm_provider');
				}
			},
			inject: [ConfigService, UserService, SubscriptionService],
		},
	],
	exports: [CrmService],
})
export class CrmModule {}

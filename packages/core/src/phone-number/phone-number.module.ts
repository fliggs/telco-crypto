import { forwardRef, Module } from '@nestjs/common';

import { SubscriptionModule } from '@/subscription/subscription.module';

import { PhoneNumberService } from './phone-number.service';
import { PhoneNumberResolver } from './phone-number.resolver';
import { PhoneNumberLoader } from './phone-number.loader';
import { PhoneNumberAssignmentResolver } from './phone-number-assignment.resolver';

@Module({
	imports: [forwardRef(() => SubscriptionModule)],
	providers: [
		PhoneNumberService,
		PhoneNumberResolver,
		PhoneNumberLoader,
		PhoneNumberAssignmentResolver,
	],
	controllers: [],
	exports: [PhoneNumberService, PhoneNumberLoader],
})
export class PhoneNumberModule {}

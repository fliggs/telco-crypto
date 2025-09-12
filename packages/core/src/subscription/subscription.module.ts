import { forwardRef, Module } from '@nestjs/common';

import { OrderModule } from '@/order/order.module';
import { PhoneNumberModule } from '@/phone-number/phone-number.module';
import { PlanModule } from '@/plan/plan.module';
import { SimModule } from '@/sim/sim.module';
import { TelcoModule } from '@/telco/telco.module';
import { OfferModule } from '@/offer/offer.module';
import { UserModule } from '@/user/user.module';
import { InvoiceModule } from '@/invoice/invoice.module';
import { VolumeModule } from '@/volume/volume.module';

import { SubscriptionLoader } from './subscription.loader';
import { SubscriptionResolver } from './subscription.resolver';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPeriodResolver } from './subscription-period.resolver';
import { SubscriptionHistoryService } from './subscription-history.service';
import { SubscriptionHistoryResolver } from './subscription-history.resolver';

@Module({
	imports: [
		forwardRef(() => PhoneNumberModule),
		forwardRef(() => PlanModule),
		forwardRef(() => SimModule),
		forwardRef(() => TelcoModule),
		forwardRef(() => OrderModule),
		forwardRef(() => OfferModule),
		forwardRef(() => UserModule),
		forwardRef(() => InvoiceModule),
		forwardRef(() => VolumeModule),
	],
	providers: [
		SubscriptionService,
		SubscriptionResolver,
		SubscriptionLoader,
		SubscriptionPeriodResolver,
		SubscriptionHistoryService,
		SubscriptionHistoryResolver,
	],
	controllers: [],
	exports: [
		SubscriptionService,
		SubscriptionLoader,
		SubscriptionHistoryService,
	],
})
export class SubscriptionModule {}

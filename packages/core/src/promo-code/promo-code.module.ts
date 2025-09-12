import { forwardRef, Module } from '@nestjs/common';

import { SubscriptionModule } from '@/subscription/subscription.module';
import { OfferModule } from '@/offer/offer.module';
import { UserModule } from '@/user/user.module';

import { PromoCodeService } from './promo-code.service';
import { PromoCodeController } from './promo-code.controller';
import { PromoCodeResolver } from './promo-code.resolver';
import { PromoCodeLoader } from './promo-code.loader';

@Module({
	imports: [
		forwardRef(() => SubscriptionModule),
		forwardRef(() => UserModule),
		forwardRef(() => OfferModule),
	],
	providers: [PromoCodeService, PromoCodeLoader, PromoCodeResolver],
	controllers: [PromoCodeController],
	exports: [PromoCodeService],
})
export class PromoCodeModule {}

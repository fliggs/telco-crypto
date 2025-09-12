import { forwardRef, Module } from '@nestjs/common';

import { AddressModule } from '@/address/address.module';
import { InvoiceModule } from '@/invoice/invoice.module';
import { OnboardingModule } from '@/onboarding/onboarding.module';
import { OrderModule } from '@/order/order.module';
import { PlanModule } from '@/plan/plan.module';
import { PhoneNumberModule } from '@/phone-number/phone-number.module';
import { PromoCodeModule } from '@/promo-code/promo-code.module';
import { SessionModule } from '@/session/session.module';
import { SimModule } from '@/sim/sim.module';
import { SubscriptionModule } from '@/subscription/subscription.module';
import { TaxModule } from '@/tax/tax.module';
import { TelcoModule } from '@/telco/telco.module';
import { UserModule } from '@/user/user.module';
import { WalletModule } from '@/wallet/wallet.module';
import { OfferModule } from '@/offer/offer.module';

import { MeController } from './me.controller';
import { CreditModule } from '@/credit/credit.module';

@Module({
	imports: [
		AddressModule,
		InvoiceModule,
		OnboardingModule,
		OrderModule,
		PlanModule,
		PhoneNumberModule,
		PromoCodeModule,
		SessionModule,
		SimModule,
		SubscriptionModule,
		TaxModule,
		TelcoModule,
		UserModule,
		WalletModule,
		CreditModule,
		forwardRef(() => OfferModule),
	],
	controllers: [MeController],
})
export class MeModule {}

import { Module } from '@nestjs/common';

import { BillingModule } from '@/billing/billing.module';
import { TaxModule } from '@/tax/tax.module';
import { TelcoModule } from '@/telco/telco.module';

import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingResolver } from './onboarding.resolver';
import { OnboardingLoader } from './onboarding.loader';

@Module({
	imports: [BillingModule, TaxModule, TelcoModule],
	providers: [OnboardingService, OnboardingResolver, OnboardingLoader],
	controllers: [OnboardingController],
	exports: [OnboardingService, OnboardingLoader],
})
export class OnboardingModule {}

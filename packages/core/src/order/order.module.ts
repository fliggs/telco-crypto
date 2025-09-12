import { forwardRef, Module } from '@nestjs/common';

import { AddressModule } from '@/address/address.module';
import { BillingModule } from '@/billing/billing.module';
import { CreditModule } from '@/credit/credit.module';
import { InvoiceModule } from '@/invoice/invoice.module';
import { PlanModule } from '@/plan/plan.module';
import { SimModule } from '@/sim/sim.module';
import { SubscriptionModule } from '@/subscription/subscription.module';
import { TaxModule } from '@/tax/tax.module';
import { TelcoModule } from '@/telco/telco.module';
import { PhoneNumberModule } from '@/phone-number/phone-number.module';
import { RewardModule } from '@/reward/reward.module';
import { OfferModule } from '@/offer/offer.module';
import { CrmModule } from '@/crm/crm.module';
import { PromoCodeModule } from '@/promo-code/promo-code.module';
import { SettingsModule } from '@/settings/settings.module';
import { UserModule } from '@/user/user.module';
import { WalletModule } from '@/wallet/wallet.module';

import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { OrderLoader } from './order.loader';
import { OrderStepService } from './order-step.service';
import { OrderStepResolver } from './order-step.resolver';
import { OrderStepLoader } from './order-step.loader';
import { OrderRunService } from './order-run.service';
import { OrderRunResolver } from './order-run.resolver';
import { OrderRunLoader } from './order-run.loader';
import { OrderRunStepService } from './order-run-step.service';
import { OrderRunStepResolver } from './order-run-step.resolver';
import { OrderRunStepLoader } from './order-run-step.loader';
import { OrderAddPlanProcessor } from './processors/add-plan.processor';
import { OrderRenewPlanProcessor } from './processors/renew-plan.processor';
import { OrderChangeSimProcessor } from './processors/change-sim.processor';
import { OrderChangePhoneNumberProcessor } from './processors/change-phone-number.processor';
import { OrderChangePlanProcessor } from './processors/change-plan.processor';
import { OrderDeactivatePlanProcessor } from './processors/deactivate-plan.processor';
import { OrderPortOutProcessor } from './processors/port-out.processor';
import { BillingStepFactory } from './processors/steps/billing.step';
import { CertificatesStepFactory } from './processors/steps/certificates.step';
import { InvoiceStepFactory } from './processors/steps/invoice.step';
import { RewardsStepFactory } from './processors/steps/rewards.step';
import { SignStepFactory } from './processors/steps/sign.step';
import { SimpleStepFactory } from './processors/steps/simple.step';
import { OrderPortOutResolver } from './order-port-out.resolver';
import { OrderPortOutService } from './order-port-out.service';

@Module({
	imports: [
		forwardRef(() => AddressModule),
		forwardRef(() => BillingModule),
		forwardRef(() => CreditModule),
		forwardRef(() => InvoiceModule),
		forwardRef(() => PlanModule),
		forwardRef(() => SimModule),
		forwardRef(() => TaxModule),
		forwardRef(() => TelcoModule),
		forwardRef(() => OfferModule),
		forwardRef(() => PhoneNumberModule),
		forwardRef(() => RewardModule),
		forwardRef(() => SubscriptionModule),
		forwardRef(() => CrmModule),
		forwardRef(() => PromoCodeModule),
		forwardRef(() => SettingsModule),
		forwardRef(() => UserModule),
		forwardRef(() => WalletModule),
	],
	providers: [
		OrderService,
		OrderResolver,
		OrderLoader,
		OrderStepService,
		OrderStepResolver,
		OrderStepLoader,
		OrderRunService,
		OrderRunResolver,
		OrderRunLoader,
		OrderRunStepService,
		OrderRunStepResolver,
		OrderRunStepLoader,
		BillingStepFactory,
		CertificatesStepFactory,
		InvoiceStepFactory,
		RewardsStepFactory,
		SignStepFactory,
		SimpleStepFactory,
		OrderAddPlanProcessor,
		OrderRenewPlanProcessor,
		OrderChangeSimProcessor,
		OrderChangePhoneNumberProcessor,
		OrderChangePlanProcessor,
		OrderDeactivatePlanProcessor,
		OrderPortOutService,
		OrderPortOutResolver,
		OrderPortOutProcessor,
	],
	controllers: [],
	exports: [OrderService, OrderLoader, OrderPortOutService],
})
export class OrderModule {}

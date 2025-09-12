import { forwardRef, Module } from '@nestjs/common';

import { AddressModule } from '@/address/address.module';
import { AuthModule } from '@/auth/auth.module';
import { BillingModule } from '@/billing/billing.module';
import { CreditModule } from '@/credit/credit.module';
import { InvoiceModule } from '@/invoice/invoice.module';
import { OnboardingModule } from '@/onboarding/onboarding.module';
import { OrderModule } from '@/order/order.module';
import { SubscriptionModule } from '@/subscription/subscription.module';
import { WalletModule } from '@/wallet/wallet.module';

import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserLoader } from './user.loader';
import { UserGroupLoader } from './group.loader';
import { UserGroupService } from './group.service';
import { UserGroupResolver } from './group.resolver';
import { UserAuthDataResolver } from './auth-data.resolver';

@Module({
	imports: [
		forwardRef(() => SubscriptionModule),
		forwardRef(() => AddressModule),
		forwardRef(() => OnboardingModule),
		forwardRef(() => CreditModule),
		forwardRef(() => OrderModule),
		forwardRef(() => InvoiceModule),
		forwardRef(() => WalletModule),
		forwardRef(() => AuthModule),
		forwardRef(() => BillingModule),
	],
	controllers: [],
	providers: [
		UserService,
		UserResolver,
		UserLoader,
		UserGroupService,
		UserGroupResolver,
		UserGroupLoader,
		UserAuthDataResolver,
	],
	exports: [UserService, UserLoader, UserGroupService, UserGroupLoader],
})
export class UserModule {}

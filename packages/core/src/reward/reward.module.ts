import { forwardRef, Module } from '@nestjs/common';

import { WalletModule } from '@/wallet/wallet.module';
import { SubscriptionModule } from '@/subscription/subscription.module';
import { OfferModule } from '@/offer/offer.module';

import { RewardService } from './reward.service';
import { RewardLoader } from './reward.loader';
import { RewardResolver } from './reward.resolver';
import { RewardPayoutService } from './payout.service';
import { RewardPayoutLoader } from './payout.loader';
import { RewardPayoutResolver } from './payout.resolver';

@Module({
	imports: [
		forwardRef(() => SubscriptionModule),
		forwardRef(() => WalletModule),
		forwardRef(() => OfferModule),
	],
	providers: [
		RewardService,
		RewardLoader,
		RewardResolver,
		RewardPayoutService,
		RewardPayoutLoader,
		RewardPayoutResolver,
	],
	controllers: [],
	exports: [
		RewardService,
		RewardLoader,
		RewardPayoutService,
		RewardPayoutLoader,
	],
})
export class RewardModule {}

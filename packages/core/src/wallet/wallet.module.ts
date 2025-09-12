import { forwardRef, Module } from '@nestjs/common';

import { SubscriptionModule } from '@/subscription/subscription.module';

import { WalletService } from './wallet.service';
import { WalletResolver } from './wallet.resolver';
import { WalletLoader } from './wallet.loader';
import { PriceService } from './price.service';
import { WalletProviderSolanaService } from './implementations/solana/solana.service';

@Module({
	imports: [forwardRef(() => SubscriptionModule)],
	providers: [
		WalletService,
		WalletLoader,
		WalletResolver,
		PriceService,
		WalletProviderSolanaService,
	],
	controllers: [],
	exports: [WalletService, WalletLoader, PriceService],
})
export class WalletModule {}

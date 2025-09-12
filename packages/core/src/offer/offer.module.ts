import { forwardRef, Module } from '@nestjs/common';

import { PlanModule } from '@/plan/plan.module';
import { RewardModule } from '@/reward/reward.module';

import { OfferService } from './offer.service';
import { OfferController } from './offer.controller';
import { OfferLoader } from './offer.loader';
import { OfferResolver } from './offer.resolver';

@Module({
	imports: [forwardRef(() => RewardModule), forwardRef(() => PlanModule)],
	providers: [OfferService, OfferResolver, OfferLoader],
	controllers: [OfferController],
	exports: [OfferService, OfferLoader],
})
export class OfferModule {}

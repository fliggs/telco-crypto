import { OrderRun, RewardPayout } from '@prisma/client';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { Step, StepFactory } from '@/order/dto/internal/step.dto';
import { OrderWithDetails, ProcessorResult } from '@/order/order.processor';
import { SubscriptionService } from '@/subscription/subscription.service';
import { RewardService } from '@/reward/reward.service';
import { OfferService } from '@/offer/offer.service';

interface Details {
	offerId: string;
}

export interface RewardsStepConfig {
	getDetails: (order: OrderWithDetails, run: OrderRun) => Promise<Details>;
}

export class RewardsStep extends Step<RewardsStepConfig> {
	public readonly name = 'REWARDS';

	constructor(
		config: RewardsStepConfig,
		private readonly offerService: OfferService,
		private readonly rewardService: RewardService,
		private readonly subService: SubscriptionService,
	) {
		super(config);
	}

	public async run(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {
		const details = await this.config.getDetails(order, run);
		const sub = await this.subService.findOne(order.subscriptionId!);

		if (sub.parentId) {
			return {
				result: 'not_eligible:not_base_subscription',
			};
		}

		const offer = await this.offerService.findOne(details.offerId);
		const rewards = await this.rewardService.findValidByOffer(details.offerId);

		const payouts: (RewardPayout | string)[] = [];

		for (const reward of rewards) {
			const payout = await this.rewardService.processReward(
				reward,
				sub,
				offer,
				order,
			);
			payouts.push(payout);
		}

		return {
			result: payouts,
		};
	}

	public async abort(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {}
}

@Injectable()
export class RewardsStepFactory extends StepFactory<RewardsStepConfig> {
	constructor(
		private readonly offerService: OfferService,
		private readonly rewardService: RewardService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
	) {
		super();
	}

	public create(config: RewardsStepConfig): RewardsStep {
		return new RewardsStep(
			config,
			this.offerService,
			this.rewardService,
			this.subService,
		);
	}
}

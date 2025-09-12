import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

import { DbService } from '@/db/db.service';
import { SubscriptionService } from '@/subscription/subscription.service';

import { OrderProcessor } from '../order.processor';
import { Step } from '../dto/internal/step.dto';

import { SimpleStepFactory } from './steps/simple.step';

@Injectable()
export class OrderChangePlanProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderChangePlanProcessor.name);

	constructor(
		db: DbService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly simpleStepFactory: SimpleStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step[] = [
		// ---------------------------
		// ----------- PLAN -----------
		// ---------------------------
		this.simpleStepFactory.create({
			name: 'PLAN',
			run: async (order, run) => {
				const details = order.changePlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const sub = await this.subService.changeOffer(
					order.subscriptionId!,
					details.offerId,
				);
				return {
					result: sub,
				};
			},
			abort: async () => {},
		}),
	];
}

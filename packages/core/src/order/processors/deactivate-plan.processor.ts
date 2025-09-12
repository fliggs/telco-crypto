import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

import { DbService } from '@/db/db.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { TelcoService } from '@/telco/telco.service';

import { OrderProcessor } from '../order.processor';
import { Step } from '../dto/internal/step.dto';

import { SimpleStepFactory } from './steps/simple.step';

@Injectable()
export class OrderDeactivatePlanProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderDeactivatePlanProcessor.name);

	constructor(
		db: DbService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly telcoService: TelcoService,
		private readonly simpleStepFactory: SimpleStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step[] = [
		// -----------------------------
		// ----------- TELCO -----------
		// -----------------------------
		this.simpleStepFactory.create({
			name: 'TELCO',
			run: async (order) => {
				const sub = await this.subService.findOne(order.subscriptionId!);

				if (!sub.simIccid) {
					throw new InternalServerErrorException('missing_sim');
				}
				if (!sub.phoneNumberMsisdn) {
					throw new InternalServerErrorException('missing_phone_number');
				}

				const res = await this.telcoService.deactivatePlan({
					iccid: sub.simIccid,
					msisdn: sub.phoneNumberMsisdn,
				});

				return {
					result: res,
				};
			},
			abort: async () => {},
		}),
	];
}

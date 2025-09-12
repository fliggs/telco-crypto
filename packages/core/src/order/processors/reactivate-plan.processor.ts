import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

import { DbService } from '@/db/db.service';
import { SubscriptionService } from '@/subscription/subscription.service';

import { Step } from '../dto/internal/step.dto';
import { OrderProcessor, OrderWithDetails } from '../order.processor';

import { InvoiceStepFactory } from './steps/invoice.step';
import { SimpleStepFactory } from './steps/simple.step';

@Injectable()
export class OrderReactivatePlanProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderReactivatePlanProcessor.name);

	constructor(
		db: DbService,
		private readonly subService: SubscriptionService,
		private readonly invoiceStepFactory: InvoiceStepFactory,
		private readonly simpleStepFactory: SimpleStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step<unknown>[] = [
		// -------------------------------
		// ----------- INVOICE -----------
		// -------------------------------
		this.invoiceStepFactory.create({
			getDetails: async (order, run) => {
				const details = order.reactivatePlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}
				const offerId =
					details.offerId ??
					(await this.subService.findOneSimple(order.subscriptionId!)).offerId;

				return {
					offerId,
				};
			},
		}),
		// -----------------------------
		// ----------- SUBSCRIPTION -----------
		// -----------------------------
		this.simpleStepFactory.create({
			name: 'SUBSCRIPTION',
			run: async (order: OrderWithDetails) => {
				if (!order.reactivatePlan) {
					throw new InternalServerErrorException('missing_order_details');
				}

				const details = order.reactivatePlan;
				const sub = await this.subService.findOne(order.subscriptionId!);

				const res = await this.subService.reactivate(sub.id);

				// TODO: This could lead to some concurrency issues
				if (details.offerId && details.offerId !== sub.offerId) {
					await this.subService.changeOffer(sub.id, details.offerId);
				}

				return {
					result: res,
				};
			},
			abort: async () => {},
		}),
	];
}

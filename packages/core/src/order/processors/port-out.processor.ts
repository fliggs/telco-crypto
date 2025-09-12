import { randomInt } from 'node:crypto';
import { add } from 'date-fns';
import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

import { DEFAULT_PORT_OUT_VALID_FOR } from '@/defaults';
import { DbService } from '@/db/db.service';
import { SubscriptionService } from '@/subscription/subscription.service';

import { OrderProcessor } from '../order.processor';
import { Step } from '../dto/internal/step.dto';

import { SimpleStepFactory } from './steps/simple.step';
import { SignStepFactory } from './steps/sign.step';

@Injectable()
export class OrderPortOutProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderPortOutProcessor.name);

	constructor(
		db: DbService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly simpleStepFactory: SimpleStepFactory,
		private readonly signStepFactory: SignStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step[] = [
		// ----------------------------
		// ----------- SIGN -----------
		// ----------------------------
		this.signStepFactory.create({
			allowMissingWallets: false,
			getDetails: async (order, run) => {
				return {
					accountNumber: this.getAccountNumber(order.userId),
				};
			},
		}),
		// --------------------------------
		// ----------- GENERATE -----------
		// --------------------------------
		this.simpleStepFactory.create({
			name: 'GENERATE',
			run: async (order) => {
				const accountNumber = this.getAccountNumber(order.userId);
				const password = randomInt(1, 999999).toFixed().padStart(6, '0');

				const timeout = add(new Date(), {
					seconds: DEFAULT_PORT_OUT_VALID_FOR,
				});

				// TODO: This is technically a side effect, but we don't immediatly process the next step so it doesn't matter
				await this.db.orderPortOutDetails.update({
					where: {
						orderId: order.id,
					},
					data: {
						accountNumber,
						password,
					},
				});

				return {
					runAt: timeout,
				};
			},
			abort: async () => {},
		}),
		// --------------------------------
		// ----------- VALIDATE -----------
		// --------------------------------
		this.simpleStepFactory.create({
			name: 'VALIDATE',
			run: async (order, run) => {
				const details = order.portOut;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				if (!details.completed) {
					if (details.error) {
						throw new InternalServerErrorException(
							`port_out_failed:${details.error}`,
						);
					} else {
						throw new InternalServerErrorException('port_out_not_completed');
					}
				}

				const sub = await this.subService.suspend(order.subscriptionId!);

				return {
					result: sub,
				};
			},
			abort: async () => {},
		}),
	];

	private getAccountNumber(userId: string) {
		return userId.substring(userId.lastIndexOf('-') + 1);
	}
}

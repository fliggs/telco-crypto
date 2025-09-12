import { SimType } from '@prisma/client';
import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

import { DbService } from '@/db/db.service';
import { SimService } from '@/sim/sim.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { TelcoService } from '@/telco/telco.service';

import { OrderProcessor } from '../order.processor';
import { Step } from '../dto/internal/step.dto';

import { SimpleStepFactory } from './steps/simple.step';

@Injectable()
export class OrderChangeSimProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderChangeSimProcessor.name);

	constructor(
		db: DbService,
		private readonly simService: SimService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly telcoService: TelcoService,
		private readonly simpleStepFactory: SimpleStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step[] = [
		// ---------------------------
		// ----------- SIM -----------
		// ---------------------------
		this.simpleStepFactory.create({
			name: 'SIM',
			run: async (order, run) => {
				const details = order.changeSim;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				// If we selected physical SIM but didn't provide an iccid, we need to wait for the user to scan it
				if (details.newSimType === SimType.P_SIM) {
					if (!details.newSimIccid) {
						throw new InternalServerErrorException('psim_missing_iccid');
					}
				} else {
					const sim = await this.simService.reserveOneFree(details.newSimType);

					details.newSimIccid = sim.iccid; // TODO: We should work on removing side-effects
					await this.db.orderChangeSimDetails.update({
						where: {
							orderId: order.id,
						},
						data: {
							newSimIccid: sim.iccid,
						},
					});

					return {
						result: sim,
					};
				}
			},
			abort: async () => {},
		}),
		// -----------------------------
		// ----------- TELCO -----------
		// -----------------------------
		this.simpleStepFactory.create({
			name: 'TELCO',
			run: async (order) => {
				const details = order.changeSim;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}
				if (!details.newSimIccid) {
					throw new InternalServerErrorException('missing_new_sim');
				}

				const sub = await this.subService.findOne(order.subscriptionId!);

				if (!sub.simIccid) {
					throw new InternalServerErrorException('missing_old_sim');
				}
				if (!sub.phoneNumberMsisdn) {
					throw new InternalServerErrorException('missing_phone_number');
				}

				const res = await this.telcoService.changeSim({
					msisdn: sub.phoneNumberMsisdn,
					oldIccid: sub.simIccid,
					newIccid: details.newSimIccid,
				});

				await this.simService.attachToSubscription(
					sub.id,
					details.newSimType,
					details.newSimIccid,
				);

				return {
					result: res,
				};
			},
			abort: async () => {},
		}),
	];
}

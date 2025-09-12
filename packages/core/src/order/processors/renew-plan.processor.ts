import { add } from 'date-fns';
import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';

import { DbService } from '@/db/db.service';
import { getScheduledDate } from '@/util';
import { AddressService } from '@/address/address.service';
import { OfferService } from '@/offer/offer.service';
import { PlanService } from '@/plan/plan.service';
import { SettingsService } from '@/settings/settings.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { TelcoService } from '@/telco/telco.service';
import { UserService } from '@/user/user.service';

import { OrderProcessor } from '../order.processor';
import { Step } from '../dto/internal/step.dto';

import { SimpleStepFactory } from './steps/simple.step';
import { InvoiceStepFactory } from './steps/invoice.step';
import { BillingStepFactory } from './steps/billing.step';
import { RewardsStepFactory } from './steps/rewards.step';
import { CertificatesStepFactory } from './steps/certificates.step';

@Injectable()
export class OrderRenewPlanProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderRenewPlanProcessor.name);

	constructor(
		db: DbService,
		private readonly addrService: AddressService,
		private readonly offerService: OfferService,
		private readonly planService: PlanService,
		private readonly settingsService: SettingsService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly telcoService: TelcoService,
		private readonly userService: UserService,
		private readonly simpleStepFactory: SimpleStepFactory,
		private readonly invoiceStepFactory: InvoiceStepFactory,
		private readonly billingStepFactory: BillingStepFactory,
		private readonly rewardsStepFactory: RewardsStepFactory,
		private readonly certificatesStepFactory: CertificatesStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step[] = [
		// -------------------------------------
		// ----------- DELAY_BILLING -----------
		// -------------------------------------
		this.simpleStepFactory.create({
			name: 'DELAY_BILLING',
			run: async (order, run) => {
				const details = order.renewPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const sub = await this.subService.findOne(order.subscriptionId!);
				const period = await this.subService.findPeriodSimple(
					details.subscriptionPeriodId,
				);

				const billingAt = getScheduledDate(
					period.startsAt,
					period.endsAt,
					sub.billingEdge,
					sub.billingOffset,
				);

				this.logger.debug(
					`Delaying renew order ${order.id} BILLING until ${billingAt}`,
				);

				return {
					runAt: billingAt,
				};
			},
			abort: async () => {},
		}),
		// ------------------------------------
		// ----------- SUBSCRIPTION -----------
		// ------------------------------------
		this.simpleStepFactory.create({
			name: 'SUBSCRIPTION',
			run: async (order, run) => {
				const details = order.renewPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const period = await this.subService.markPeriodProcessing(
					details.subscriptionPeriodId,
				);

				return {
					result: period,
				};
			},
			abort: async (order, run) => {
				const details = order.renewPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const period = await this.subService.markPeriodFailed(
					details.subscriptionPeriodId,
				);

				await this.subService.markSuspended(order.subscriptionId!);

				return {
					result: period,
				};
			},
		}),
		// -------------------------------
		// ----------- INVOICE -----------
		// -------------------------------
		this.invoiceStepFactory.create({
			getDetails: async (order, run) => {
				const details = order.renewPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				return {
					offerId: details.offerId,
				};
			},
		}),
		// -------------------------------
		// ----------- BILLING -----------
		// -------------------------------
		this.billingStepFactory.create({}),
		// -----------------------------------
		// ----------- DELAY_TELCO -----------
		// -----------------------------------
		this.simpleStepFactory.create({
			name: 'DELAY_TELCO',
			run: async (order, run) => {
				const details = order.renewPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const sub = await this.subService.findOne(order.subscriptionId!);
				const period = await this.subService.findPeriodSimple(
					details.subscriptionPeriodId,
				);

				const telcoAt = getScheduledDate(
					period.startsAt,
					period.endsAt,
					sub.telcoEdge,
					sub.telcoOffset,
				);

				this.logger.debug(
					`Delaying renew order ${order.id} TELCO until ${telcoAt}`,
				);

				return {
					runAt: telcoAt,
				};
			},
			abort: async () => {},
		}),
		// -----------------------------
		// ----------- TELCO -----------
		// -----------------------------
		this.simpleStepFactory.create({
			name: 'TELCO',
			run: async (order, run) => {
				const details = order.renewPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const user = await this.userService.findOne(order.userId);
				const addrs = await this.addrService.findByUser(order.userId);
				const sub = await this.subService.findOne(order.subscriptionId!);
				const period = await this.subService.findPeriodSimple(
					details.subscriptionPeriodId,
				);
				const offer = await this.offerService.findOne(details.offerId);
				const plan = await this.planService.findOneWithVolumes(offer.planId);

				const subParent = sub.parentId
					? await this.subService.findOneSimple(sub.parentId)
					: null;

				const iccid = sub.simIccid ?? subParent?.simIccid ?? null;
				const msisdn =
					sub.phoneNumberMsisdn ?? subParent?.phoneNumberMsisdn ?? null;

				const retries = await this.settingsService.getRetries();
				const totalRetryTime = retries.reduce((total, time) => total + time, 0);
				const expiresAt = add(period.endsAt, { seconds: totalRetryTime });

				const res = await this.telcoService.activatePlan({
					user: user,
					iccid: iccid,
					msisdn: msisdn,
					plan: plan,
					expiresAt: expiresAt,
					volumes: plan.volumes,
					addresses: addrs,
					isRenewal: true,
					portIn: null,
				});

				await this.subService.markActive(order.subscriptionId!);
				await this.subService.markPeriodDone(details.subscriptionPeriodId);

				return {
					result: res,
				};
			},
			abort: async () => {},
		}),
		// -------------------------------
		// ----------- REWARDS -----------
		// -------------------------------
		this.rewardsStepFactory.create({
			getDetails: async (order) => {
				const details = order.renewPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				return {
					offerId: details.offerId,
				};
			},
		}),
		// ------------------------------------
		// ----------- CERTIFICATES -----------
		// ------------------------------------
		this.certificatesStepFactory.create({}),
	];
}

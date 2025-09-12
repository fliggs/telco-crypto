import { AddressType, Credit, SimStatus, SimType } from '@prisma/client';
import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { add } from 'date-fns';

import { DbService } from '@/db/db.service';
import { AddressService } from '@/address/address.service';
import { CreditService } from '@/credit/credit.service';
import { CrmService } from '@/crm/crm.service';
import { OfferService } from '@/offer/offer.service';
import { PhoneNumberService } from '@/phone-number/phone-number.service';
import { PlanService } from '@/plan/plan.service';
import { PromoCodeService } from '@/promo-code/promo-code.service';
import { SettingsService } from '@/settings/settings.service';
import { SimService } from '@/sim/sim.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { TelcoService } from '@/telco/telco.service';
import { UserService } from '@/user/user.service';

import { OrderProcessor } from '../order.processor';
import { Step } from '../dto/internal/step.dto';

import { RewardsStepFactory } from './steps/rewards.step';
import { CertificatesStepFactory } from './steps/certificates.step';
import { InvoiceStepFactory } from './steps/invoice.step';
import { BillingStepFactory } from './steps/billing.step';
import { SimpleStepFactory } from './steps/simple.step';

@Injectable()
export class OrderAddPlanProcessor extends OrderProcessor {
	protected readonly logger = new Logger(OrderAddPlanProcessor.name);

	constructor(
		db: DbService,
		private readonly addrService: AddressService,
		private readonly creditService: CreditService,
		private readonly offerService: OfferService,
		@Inject(forwardRef(() => PhoneNumberService))
		private readonly phoneNumService: PhoneNumberService,
		private readonly planService: PlanService,
		private readonly promoService: PromoCodeService,
		private readonly settingsService: SettingsService,
		private readonly simService: SimService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly telcoService: TelcoService,
		private readonly userService: UserService,
		private readonly crmService: CrmService,
		private readonly simpleStepFactory: SimpleStepFactory,
		private readonly invoiceStepFactory: InvoiceStepFactory,
		private readonly billingStepFactory: BillingStepFactory,
		private readonly rewardsStepFactory: RewardsStepFactory,
		private readonly certificateStepFactory: CertificatesStepFactory,
	) {
		super(db);
	}

	protected readonly steps: Step[] = [
		// ------------------------------------
		// ----------- SUBSCRIPTION -----------
		// ------------------------------------
		this.simpleStepFactory.create({
			name: 'SUBSCRIPTION',
			run: async (order, run) => {
				const details = order.addPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const sub = await this.subService.create({
					offerId: details.offerId,
					orderId: order.id,
					userId: order.userId,
					parentId: details.parentSubscriptionId,
				});

				// This is updated as a side-effect in case other steps run directly after.
				// The database is updated by the previous function.
				// TODO: We should not use this kind of side-effects
				order.subscriptionId = sub.id;
				details.subscriptionPeriodId = sub.currentPeriodId;

				return {
					result: sub,
				};
			},
			abort: async () => {},
		}),
		// -----------------------------------
		// ----------- PROMO CODES -----------
		// -----------------------------------
		this.simpleStepFactory.create({
			name: 'PROMO_CODES',
			run: async (order) => {
				const activations = await this.promoService.findActivationsByOrder(
					order.id,
				);

				for (const activation of activations) {
					await this.promoService.attachActivationToSubscription(
						activation.id,
						order.subscriptionId!,
					);
				}

				return {
					result: activations,
				};
			},
			abort: async () => {},
		}),
		// -------------------------------
		// ----------- CREDITS -----------
		// -------------------------------
		this.simpleStepFactory.create({
			name: 'CREDITS',
			run: async (order, run) => {
				const details = order.addPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const offer = await this.offerService.findOne(details.offerId);

				// TODO: Make this idempotent
				let credit: Credit | null = null;
				if (offer.providedCredits && offer.providedCredits.gt(0)) {
					credit = await this.creditService.create({
						title: 'Free credits', // TODO: Make this configurable
						providedCost: offer.providedCredits,
						userId: order.userId,
						subscriptionId: order.subscriptionId!,
					});
				}

				return {
					result: credit,
				};
			},
			abort: async () => {},
		}),
		// -------------------------------
		// ----------- INVOICE -----------
		// -------------------------------
		this.invoiceStepFactory.create({
			getDetails: async (order, run) => {
				const details = order.addPlan;
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
		// --------------------------------
		// ----------- SHIPPING -----------
		// --------------------------------
		this.simpleStepFactory.create({
			name: 'SHIPPING',
			run: async (order, run) => {
				const sub = await this.subService.findOne(order.subscriptionId!);
				if (sub.parentId) {
					return {
						result: 'not_required',
					};
				}

				const details = order.addPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				if (details.simType === SimType.E_SIM) {
					return {
						result: 'not_required',
					};
				}

				if (details.simIccid) {
					// If we already have an iccid, then we just directly activate that p-sim
					return {
						result: 'not_required',
					};
				}

				const address = await this.addrService.findByUserAndType(
					order.userId,
					AddressType.Shipping,
				);
				if (!address) {
					throw new InternalServerErrorException(
						'user_missing_shipping_address',
					);
				}

				const user = await this.userService.findOne(order.userId);

				// TODO: This needs better handling
				// TODO: Maybe we can make this nicer instead of a direcet DB accesss
				const shipping = await this.db.orderShippingDetails.upsert({
					where: {
						orderId: order.id,
					},
					create: {
						orderId: order.id,
						name: address.name ?? `${user.firstName} ${user.lastName}`,
						line1: address.line1,
						line2: address.line2,
						line3: address.line3,
						line4: address.line4,
						city: address.city,
						postalCode: address.postalCode,
						province: address.province,
						country: address.country,
					},
					update: {},
				});

				if (!shipping.shippedAt) {
					await this.crmService.shipSim(order, address);
					// TODO: Maybe we can make this delay nicer?
					throw new InternalServerErrorException('waiting_for_shipping');
				}

				const offer = await this.offerService.findOne(details.offerId);
				const plan = await this.planService.findOneWithVolumes(offer.planId);

				await this.crmService.simShipped(user, sub, offer, plan);

				return {
					result: shipping,
				};
			},
			abort: async () => {},
		}),
		// ---------------------------
		// ----------- SIM -----------
		// ---------------------------
		this.simpleStepFactory.create({
			name: 'SIM',
			run: async (order, run) => {
				const sub = await this.subService.findOne(order.subscriptionId!);
				if (sub.parentId) {
					return {
						result: 'not_required',
					};
				}

				const details = order.addPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				if (details.simType === SimType.P_SIM && !details.simIccid) {
					throw new InternalServerErrorException('psim_missing_iccid');
				}

				let iccid = details.simIccid;
				if (iccid) {
					const sim = await this.simService.findOne(iccid);
					if (sim.status !== SimStatus.AVAILABLE) {
						throw new InternalServerErrorException('sim_not_available');
					}
				} else {
					const sim = await this.simService.reserveOneFree(details.simType);
					iccid = sim.iccid;
				}

				const sim = await this.simService.attachToSubscription(
					order.subscriptionId!,
					details.simType,
					iccid,
				);

				return {
					result: sim,
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
				const details = order.addPlan;
				if (!details) {
					throw new InternalServerErrorException('missing_details');
				}

				const offer = await this.offerService.findOne(details.offerId);
				const plan = await this.planService.findOneWithVolumes(offer.planId);
				const user = await this.userService.findOne(order.userId);
				const addrs = await this.addrService.findByUser(order.userId);
				const sub = await this.subService.findOne(order.subscriptionId!);
				const period = await this.subService.findPeriodSimple(
					details.subscriptionPeriodId!,
				);

				const subParent = sub.parentId
					? await this.subService.findOneSimple(sub.parentId)
					: null;

				let iccid =
					details.simIccid ?? sub.simIccid ?? subParent?.simIccid ?? null;
				let sim = iccid ? await this.simService.findOne(iccid) : null;

				let msisdn =
					(details.portIn ? details.portInMsisdn : undefined) ??
					sub.phoneNumberMsisdn ??
					subParent?.phoneNumberMsisdn ??
					null;

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
					isRenewal: false,
					portIn: details.portIn
						? {
								msisdn: details.portInMsisdn,
								accountNumber: details.portInAccountNumber,
								password: details.portInPassword,
								postalCode: details.portInPassword,
							}
						: null,
				});

				if (
					!sub.parentId &&
					res?.msisdn &&
					res.msisdn !== sub.phoneNumberMsisdn
				) {
					msisdn = res.msisdn;
					await this.phoneNumService.attachToSubscription(
						sub.id,
						!details.portIn,
						res.msisdn,
					);
				}

				if (!sub.parentId && res.iccid && res.iccid !== sub.simIccid) {
					iccid = res.iccid;
					sim = await this.simService.findOne(iccid);
					await this.simService.attachToSubscription(sub.id, sim.type, iccid);
				}

				await this.subService.markActive(order.subscriptionId!);
				await this.subService.markPeriodDone(details.subscriptionPeriodId!);

				// Only notify for base subscriptions
				if (!subParent) {
					if (!sim) {
						throw new InternalServerErrorException('missing_sim_after_telco');
					}
					if (!msisdn) {
						throw new InternalServerErrorException(
							'missing_phone_number_after_telco',
						);
					}

					await this.crmService.subActivated(
						user,
						sub,
						offer,
						plan,
						msisdn,
						sim,
					);
				}

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
			getDetails: async (order, run) => {
				const details = order.addPlan;
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
		this.certificateStepFactory.create({}),
	];
}

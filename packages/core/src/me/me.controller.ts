import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Put,
	Query,
	Req,
	SerializeOptions,
	Version,
} from '@nestjs/common';
import {
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
	AddressType,
	Offer,
	Order,
	OrderAddPlanDetails,
	OrderChangePlanDetails,
	OrderStatus,
	OrderStep,
	OrderType,
	Plan,
	SimStatus,
	SimType,
	SubscriptionStatus,
} from '@prisma/client';

import { DecimalNumber } from '@/decimal.dto';
import { DEFAULT_TOKEN_HISTORY_DAYS } from '@/defaults';
import { LoggedIn, LoggedInSubject } from '@/auth/logged-in.decorator';
import { AddressService } from '@/address/address.service';
import { CreditService } from '@/credit/credit.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { OfferService } from '@/offer/offer.service';
import { OnboardingService } from '@/onboarding/onboarding.service';
import { OrderService } from '@/order/order.service';
import { PlanService } from '@/plan/plan.service';
import { PublicAddressDto } from '@/address/dto/response/public-address.dto';
import { PublicCertificateDto } from '@/wallet/dto/response/public-certificate.dto';
import { PublicInvoiceWithOrderAndItemsDto } from '@/invoice/dto/response/public-invoice+order+items.dto';
import { PublicOfferWithPlanWithVolumesDto } from '@/offer/dto/response/public-offer+plan+volumes.dto';
import { PublicOnboardingProgressDto } from '@/onboarding/dto/response/public-onboarding-progress.dto';
import { PublicOrderDto } from '@/order/dto/response/public-order.dto';
import { PublicOrderStepDto } from '@/order/dto/response/public-order-step.dto';
import { PublicOrderWithDetailsDto } from '@/order/dto/response/public-order+details.dto';
import { PublicOrderWithOfferDto } from '@/order/dto/response/public-order+offer.dto';
import { PublicSessionTokensDto } from '@/session/dto/response/public-session-tokens.dto';
import { PublicSigningRequestDto } from '@/wallet/dto/response/public-signing-request.dto';
import { PublicSimDetailsDto } from '@/sim/dto/response/public-sim-details.dto';
import { PublicSubscriptionDto } from '@/subscription/dto/response/public-subscription.dto';
import { PublicSubscriptionPeriodWithOfferDto } from '@/subscription/dto/response/public-subscription-period+offer.dto';
import { PublicSubscriptionWithOfferDto } from '@/subscription/dto/response/public-subscription+offer.dto';
import { PublicTaxItemDto } from '@/tax/dto/response/public-tax-item.dto';
import { PublicTokenBalanceDto } from '@/wallet/dto/response/public-token-balance.dto';
import { PublicTokenHistoryDto } from '@/wallet/dto/response/public-token-history.dto';
import { PublicVolumeUsageDto } from '@/volume/dto/response/public-volume-usage.dto';
import { PublicWalletDto } from '@/wallet/dto/response/public-wallet.dto';
import { SessionService } from '@/session/session.service';
import { SimService } from '@/sim/sim.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { TaxService } from '@/tax/tax.service';
import { TelcoService } from '@/telco/telco.service';
import { UserAccess } from '@/auth/access.decorator';
import { UserService } from '@/user/user.service';
import { WalletService } from '@/wallet/wallet.service';

import { ChangeMyAddressDto } from './dto/request/change-my-address.dto';
import { CreateMyOrderDto } from './dto/request/create-my-order.dto';
import { CreateMyWalletDto } from './dto/request/create-my-wallet.dto';
import { PublicMeDto } from './dto/response/public-me.dto';
import { UpdateMeDto } from './dto/request/update-me.dto';
import { UpdateMyOnboardingProgressDto } from './dto/request/update-my-onboarding.dto';
import { UpdateMyOrderDto } from './dto/request/update-my-order.dto';
import { UpdateMyOrderStepAttachSimDto } from './dto/request/update-my-order-step-attach-sim.dto';
import { UpdateMyOrderStepSignDto } from './dto/request/update-my-order-step-sign.dto';
import { UpdateMyOrderV2Dto } from './dto/request/update-my-order-v2.dto';
import { UpdateMySubscriptionDto } from './dto/request/update-my-subscription.dto';
import { UpdateMyWalletDto } from './dto/request/update-my-wallet.dto';
import { ValidateMyWalletDto } from './dto/request/validate-my-wallet.dto';

type LegacyOrderInput = Order & { currentStep: OrderStep | null } & {
	addPlan: (OrderAddPlanDetails & { offer: Offer & { plan: Plan } }) | null;
	changePlan:
		| (OrderChangePlanDetails & { offer: Offer & { plan: Plan } })
		| null;
};

@Controller({
	path: 'users/me',
	version: '1',
})
export class MeController {
	constructor(
		private readonly addressService: AddressService,
		private readonly invoiceService: InvoiceService,
		private readonly offerService: OfferService,
		private readonly onboardingService: OnboardingService,
		private readonly orderService: OrderService,
		private readonly planService: PlanService,
		private readonly sessionService: SessionService,
		private readonly simService: SimService,
		private readonly subService: SubscriptionService,
		private readonly taxService: TaxService,
		private readonly telcoService: TelcoService,
		private readonly userService: UserService,
		private readonly walletService: WalletService,
		private readonly creditService: CreditService,
	) {}

	@Get()
	@UserAccess()
	@ApiOkResponse({ type: PublicMeDto })
	@SerializeOptions({ type: PublicMeDto })
	async findMe(@LoggedIn() user: LoggedInSubject) {
		return user;
	}

	@Patch()
	@UserAccess()
	@SerializeOptions({ type: PublicSessionTokensDto })
	async updateMe(
		@LoggedIn() user: LoggedInSubject,
		@Body() dto: UpdateMeDto,
		@Req() req: Request,
	): Promise<PublicSessionTokensDto> {
		const newUser = await this.userService.update(user.id, {
			firstName: dto.firstName,
			lastName: dto.lastName,
			settings: dto.settings,
		});

		const newSessionUser: LoggedInSubject = {
			provider: user.provider,
			strategy: user.strategy,
			isAdmin: user.isAdmin,
			...newUser,
		};
		const session = this.sessionService.retrieve(
			req,
			user.provider,
			user.strategy,
		);
		this.sessionService.store(req, user.provider, user.strategy, {
			...session,
			user: newSessionUser,
		});

		req.user = newSessionUser;

		return this.sessionService.generateTokens(req.user);
	}

	@Get('invoices')
	@UserAccess()
	@SerializeOptions({ type: PublicInvoiceWithOrderAndItemsDto })
	async findMyInvoices(
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicInvoiceWithOrderAndItemsDto[]> {
		return this.invoiceService.findByUserWithOrderAndItems(user.id);
	}

	@Get('credit-balance')
	@UserAccess()
	@ApiOkResponse({ type: String })
	@SerializeOptions({ type: String })
	async getCreditBalance(
		@LoggedIn() user: LoggedInSubject,
	): Promise<DecimalNumber> {
		return this.creditService.computeUserCreditBalance(user.id);
	}

	@Get('onboarding')
	@UserAccess()
	@SerializeOptions({ type: PublicOnboardingProgressDto })
	async findMyOnboardingProgress(
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicOnboardingProgressDto[]> {
		return this.onboardingService.getProgressByUser(user.id);
	}

	@Put('onboarding')
	@UserAccess()
	async updateMyOnboardingProgress(
		@LoggedIn() user: LoggedInSubject,
		@Body() dto: UpdateMyOnboardingProgressDto,
	): Promise<void> {
		await this.onboardingService.changeProgress(
			user.id,
			dto.stage,
			dto.completed,
		);
	}

	@Get('orders')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	@ApiOperation({ deprecated: true })
	@ApiQuery({
		name: 'status',
		isArray: true,
		required: false,
		enum: OrderStatus,
		enumName: 'OrderStatus',
	})
	@ApiQuery({
		name: 'types',
		isArray: true,
		required: false,
		enum: OrderType,
		enumName: 'OrderType',
	})
	async findMyOrders(
		@LoggedIn() user: LoggedInSubject,
		@Query('status') status?: OrderStatus | OrderStatus[],
		@Query('types') types?: OrderType | OrderType[],
	): Promise<PublicOrderWithOfferDto[]> {
		if (types && !Array.isArray(types)) {
			types = [types];
		}
		if (status && !Array.isArray(status)) {
			status = [status];
		}

		const orders = await this.orderService.findByUserWithOffer(
			user.id,
			types,
			status,
		);
		return orders.map(this.toLegacyOrder);
	}

	@Get('orders')
	@Version('2')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderDto })
	@ApiQuery({
		name: 'status',
		isArray: true,
		required: false,
		enum: OrderStatus,
		enumName: 'OrderStatus',
	})
	@ApiQuery({
		name: 'type',
		isArray: true,
		required: false,
		enum: OrderType,
		enumName: 'OrderType',
	})
	@ApiQuery({
		name: 'step',
		required: false,
	})
	async findMyOrdersV2(
		@LoggedIn() user: LoggedInSubject,
		@Query('status') status?: OrderStatus[],
		@Query('type') type?: OrderType[],
		@Query('step') step?: string,
	): Promise<PublicOrderDto[]> {
		if (type && !Array.isArray(type)) {
			type = [type];
		}
		if (status && !Array.isArray(status)) {
			status = [status];
		}
		const stepNo = step ? Number(step) : undefined;

		return this.orderService.findByUser(user.id, type, status, stepNo);
	}

	@Post('orders')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	async createMyOrder(
		@LoggedIn() user: LoggedInSubject,
		@Body() dto: CreateMyOrderDto,
	): Promise<PublicOrderWithOfferDto> {
		let newOrder: LegacyOrderInput;
		switch (dto.type) {
			case OrderType.ADD_PLAN: {
				if (!dto.offerId) {
					throw new BadRequestException('missing_offer_id');
				}

				const offer = dto.promoCodeId
					? await this.offerService.findOneWithPromoAndValid(
							dto.offerId,
							dto.promoCodeId,
						)
					: await this.offerService.findOnePublicValid(dto.offerId);

				newOrder = await this.orderService.createAddPlan({
					userId: user.id,
					offerId: offer.id,
					promoCodeId: dto.promoCodeId,
					parentSubId: dto.subscriptionId,
				});
				break;
			}

			case OrderType.CHANGE_PLAN: {
				if (!dto.subscriptionId) {
					throw new BadRequestException('missing_subscription_id');
				}
				if (!dto.offerId) {
					throw new BadRequestException('missing_offer_id');
				}

				const offer = dto.promoCodeId
					? await this.offerService.findOneWithPromoAndValid(
							dto.offerId,
							dto.promoCodeId,
						)
					: await this.offerService.findOnePublicValid(dto.offerId);

				newOrder = await this.orderService.createChangePlan({
					userId: user.id,
					subscriptionId: dto.subscriptionId,
					offerId: offer.id,
					promoCodeId: dto.promoCodeId,
				});
				break;
			}

			case OrderType.PORT_OUT: {
				if (!dto.subscriptionId) {
					throw new BadRequestException('missing_subscription_id');
				}

				newOrder = await this.orderService.createPortOut({
					userId: user.id,
					subId: dto.subscriptionId,
				});
				break;
			}

			default: {
				throw new BadRequestException('invalid_order_type');
			}
		}

		return this.toLegacyOrder(newOrder);
	}

	@Get('orders/:orderId')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	@ApiOperation({ deprecated: true })
	async findMyOrder(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
	): Promise<PublicOrderWithOfferDto> {
		const order = await this.orderService.findOneForUserWithOffer(
			orderId,
			user.id,
		);
		return this.toLegacyOrder(order);
	}

	@Get('orders/:orderId')
	@Version('2')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithDetailsDto })
	@ApiOkResponse({ type: PublicOrderWithDetailsDto })
	async findMyOrderV2(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
	) {
		const order = await this.orderService.findOneForUserWithDetails(
			orderId,
			user.id,
		);

		return {
			...order,
			offer: (order.addPlan ?? order.changePlan)?.offer!,
		};
	}

	@Patch('orders/:orderId')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	@ApiOperation({ deprecated: true })
	async updateMyOrder(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
		@Body() dto: UpdateMyOrderDto,
	): Promise<PublicOrderWithOfferDto> {
		const order = await this.orderService.findOneForUserWithOffer(
			orderId,
			user.id,
		);

		let newOrder: LegacyOrderInput;
		if (dto.confirm) {
			newOrder = await this.orderService.confirmAddPlanDraft(order.id);
		} else {
			// TODO: We could make this nicer by changing the structure of UpdateMyOrderDto
			newOrder = await this.orderService.updateAddPlanDraft(order.id, {
				offerId: dto.offerId,
				// In V1 of this endpoint, setting any different offer than the initial one removes
				// the promo code that was being used. Use V2 or V3 of this method to switch promo code.
				// If no offer different offer is set, then this value is ignored
				promoCodeId: undefined,
				portIn: {
					isPortingIn: dto.isPortingIn ?? false,
					msisdn: dto.msisdn,
					postalCode: dto.postalCode,
					accountNumber: dto.ospAccountNumber,
					password: dto.ospPassword,
				},
				simSelection: dto.simType
					? { simType: dto.simType, iccid: dto.simIccid }
					: undefined,
			});
		}

		return this.toLegacyOrder(newOrder);
	}

	@Patch('orders/:orderId')
	@Version('2')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	@ApiOperation({ deprecated: true })
	async updateMyOrderV2(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
		@Body() dto: UpdateMyOrderV2Dto,
	): Promise<PublicOrderWithOfferDto> {
		const order = await this.orderService.findOneForUserWithOffer(
			orderId,
			user.id,
		);

		let newOrder: LegacyOrderInput;
		if (dto.confirm) {
			newOrder = await this.orderService.confirmAddPlanDraft(order.id);
		} else {
			// TODO: We could make this nicer by changing the structure of UpdateMyOrderDto
			newOrder = await this.orderService.updateAddPlanDraft(order.id, {
				offerId: dto.offerId,
				promoCodeId: dto.promoCodeId,
				portIn: dto.portIn,
				simSelection: dto.simSelection,
			});
		}

		return this.toLegacyOrder(newOrder);
	}

	@Patch('orders/:orderId')
	@Version('3')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithDetailsDto })
	@ApiOkResponse({ type: PublicOrderWithDetailsDto })
	async updateMyOrderV3(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
		@Body() dto: UpdateMyOrderV2Dto,
	) {
		let order = await this.orderService.findOneForUserWithDetails(
			orderId,
			user.id,
		);

		if (dto.confirm) {
			await this.orderService.confirmAddPlanDraft(order.id);
		} else {
			await this.orderService.updateAddPlanDraft(order.id, {
				offerId: dto.offerId,
				promoCodeId: dto.promoCodeId,
				portIn: dto.portIn,
				simSelection: dto.simSelection,
			});
		}

		// TODO: We're querying this again because the statements above don't return the correct data
		order = await this.orderService.findOneForUserWithDetails(orderId, user.id);
		return {
			...order,
			offer: (order.addPlan ?? order.changePlan)?.offer!,
		};
	}

	@Patch('orders/:orderId/sim-selection')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	async updateMyOrderSimSelection(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
		@Body() dto: UpdateMyOrderStepAttachSimDto,
	): Promise<PublicOrderWithOfferDto> {
		const order = await this.orderService.findOneForUserWithOffer(
			orderId,
			user.id,
		);

		// The normal order flow throws an error if the SIM iccid is missing, which is why it should have the ERROR status
		if (order.status !== OrderStatus.ERROR) {
			throw new BadRequestException('order_not_ready');
		}

		const sim = await this.simService.findOne(dto.iccid);
		if (sim.type !== SimType.P_SIM) {
			throw new BadRequestException('sim_not_physical');
		}
		if (sim.status !== SimStatus.AVAILABLE) {
			throw new BadRequestException('sim_not_available');
		}

		await this.orderService.updateAddPlanIccid(order.id, dto.iccid);

		return this.toLegacyOrder(order);
	}

	@Patch('orders/:orderId/steps/ATTACH_SIM/:stepId')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	async updateMyOrderStepAttachSim(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
		@Param('stepId') orderStepId: string,
		@Body() dto: UpdateMyOrderStepAttachSimDto,
	): Promise<PublicOrderWithOfferDto> {
		const order = await this.orderService.findOneForUserWithOffer(
			orderId,
			user.id,
		);

		// The normal order flow throws an error if the SIM iccid is missing, which is why it should have the ERROR status
		if (order.status !== OrderStatus.ERROR) {
			throw new BadRequestException('order_not_ready');
		}

		const sim = await this.simService.findOne(dto.iccid);
		if (sim.type !== SimType.P_SIM) {
			throw new BadRequestException('sim_not_physical');
		}
		if (sim.status !== SimStatus.AVAILABLE) {
			throw new BadRequestException('sim_not_available');
		}

		await this.orderService.updateAddPlanIccid(order.id, dto.iccid);

		await this.orderService.retry(order.id);

		return this.toLegacyOrder(order);
	}

	@Patch('orders/:orderId/steps/current/SIGN')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithDetailsDto })
	@ApiOkResponse({ type: PublicOrderWithDetailsDto })
	async updateMyOrderStepSign(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
		@Body() dto: UpdateMyOrderStepSignDto,
	) {
		const order = await this.orderService.findOneForUserWithDetails(
			orderId,
			user.id,
		);

		// The normal order flow throws an error when waiting for the signature, which is why it should have the ERROR status
		if (order.status !== OrderStatus.ERROR) {
			throw new BadRequestException('order_not_ready');
		}

		if (order.currentStep?.type !== 'SIGN') {
			throw new BadRequestException('incorrect_order_step');
		}

		const newOrder = await this.orderService.updateSignSignature(
			order.id,
			dto.signature,
		);

		return {
			...newOrder,
			offer: (order.addPlan ?? order.changePlan)?.offer!,
		};
	}

	@Get('orders/:orderId/taxes')
	@UserAccess()
	@SerializeOptions({ type: PublicTaxItemDto })
	async findMyOrderTaxes(
		@LoggedIn() user: LoggedInSubject,
		@Param('orderId') orderId: string,
	): Promise<PublicTaxItemDto[]> {
		const order = await this.orderService.findOneForUserWithOffer(
			orderId,
			user.id,
		);
		const addresses = await this.addressService.findByUser(user.id);
		return this.taxService.calcForOrder({
			orderId: order.id,
			user,
			offer: (order.addPlan?.offer ?? order.changePlan?.offer)!,
			addresses,
		});
	}

	@Get('subscriptions')
	@UserAccess()
	@SerializeOptions({ type: PublicSubscriptionWithOfferDto })
	@ApiQuery({ name: 'baseOnly', required: false })
	async findMySubscriptions(
		@LoggedIn() user: LoggedInSubject,
		@Query('baseOnly') baseOnly?: boolean,
	): Promise<PublicSubscriptionWithOfferDto[]> {
		return this.subService.findByUserWithCurrentPeriodAndOffer(
			user.id,
			baseOnly,
		);
	}

	@Get('subscriptions/:subId')
	@UserAccess()
	@SerializeOptions({ type: PublicSubscriptionWithOfferDto })
	async findMySubscription(
		@Param('subId') subId: string,
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicSubscriptionWithOfferDto> {
		return this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
			subId,
			user.id,
		);
	}

	@Put('subscriptions/:subId')
	@UserAccess()
	@SerializeOptions({ type: PublicSubscriptionDto })
	async uncancelMySubscription(
		@LoggedIn() user: LoggedInSubject,
		@Param('subId') subId: string,
	): Promise<PublicSubscriptionDto> {
		const sub =
			await this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
				subId,
				user.id,
			);
		if (sub.status !== SubscriptionStatus.CANCELLED) {
			throw new BadRequestException('sub_is_not_cancelled');
		}
		return this.subService.uncancel(sub.id);
	}

	@Patch('subscriptions/:subId')
	@UserAccess()
	@SerializeOptions({ type: PublicSubscriptionDto })
	async updateMySubscription(
		@LoggedIn() user: LoggedInSubject,
		@Param('subId') subId: string,
		@Body() dto: UpdateMySubscriptionDto,
	): Promise<PublicSubscriptionDto> {
		const sub =
			await this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
				subId,
				user.id,
			);

		if (dto.label) {
			return this.subService.updateLabel(sub.id, dto.label);
		} else {
			return sub;
		}
	}

	@Delete('subscriptions/:subId')
	@UserAccess()
	@SerializeOptions({ type: PublicSubscriptionDto })
	async deleteMySubscription(
		@LoggedIn() user: LoggedInSubject,
		@Param('subId') subId: string,
	): Promise<PublicSubscriptionDto> {
		const sub =
			await this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
				subId,
				user.id,
			);
		if (sub.status !== SubscriptionStatus.ACTIVE) {
			throw new BadRequestException('sub_is_not_active');
		}
		return this.subService.cancel(sub.id);
	}

	@Get('subscriptions/:subId/periods')
	@UserAccess()
	@SerializeOptions({ type: PublicSubscriptionPeriodWithOfferDto })
	async findMySubscriptionPeriods(
		@Param('subId') subId: string,
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicSubscriptionPeriodWithOfferDto[]> {
		const sub =
			await this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
				subId,
				user.id,
			);
		return this.subService.findPeriodsBySubscriptionWithOffer(sub.id);
	}

	@Get('subscriptions/:subId/orders')
	@UserAccess()
	@SerializeOptions({ type: PublicOrderWithOfferDto })
	async findMySubscriptionOrders(
		@Param('subId') subId: string,
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicOrderWithOfferDto[]> {
		const sub =
			await this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
				subId,
				user.id,
			);
		const orders = await this.orderService.findBySubscriptionWithOffer(sub.id);
		return orders.map(this.toLegacyOrder);
	}

	@Get('subscriptions/:subId/offers')
	@UserAccess()
	@SerializeOptions({ type: PublicOfferWithPlanWithVolumesDto })
	async findMySubscriptionOffers(
		@LoggedIn() user: LoggedInSubject,
		@Param('subId') subId: string,
	): Promise<PublicOfferWithPlanWithVolumesDto[]> {
		const sub =
			await this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
				subId,
				user.id,
			);
		return this.offerService.findAllPublicValidChildrenByPlanWithPlan(
			sub.offer.planId,
		);
	}

	@Get('subscriptions/:subId/children')
	@UserAccess()
	@SerializeOptions({ type: PublicSubscriptionWithOfferDto })
	async findMySubscriptionChildren(
		@LoggedIn() user: LoggedInSubject,
		@Param('subId') subId: string,
	): Promise<PublicSubscriptionWithOfferDto[]> {
		return this.subService.findChildrenForUserWithCurrentPeriodAndOffer(
			subId,
			user.id,
		);
	}

	@Get('subscriptions/:subId/sims/active/details')
	@UserAccess()
	@SerializeOptions({ type: PublicSimDetailsDto })
	async findMySubscriptionActiveSimDetails(
		@Param('subId') subId: string,
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicSimDetailsDto> {
		const sim = await this.simService.findOneActiveBySubAndUser(subId, user.id);
		const details = await this.telcoService.getSimDetails({
			type: sim.type,
			iccid: sim.iccid,
		});
		return {
			...sim,
			...details,
		};
	}

	@Get('subscriptions/:subId/sims/active/usage')
	@UserAccess()
	@SerializeOptions({ type: PublicVolumeUsageDto })
	async findMySubscriptionActiveSimUsage(
		@Param('subId') subId: string,
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicVolumeUsageDto[]> {
		const sub = await this.subService.findOneForUserWithOfferAndPlanAndVolumes(
			subId,
			user.id,
		);
		if (sub.parentId) {
			throw new BadRequestException('invalid_for_child_subs');
		}

		const childSubs =
			await this.subService.findChildrenWithOfferAndPlanAndVolumes(sub.id);

		return this.telcoService.getSubscriptionUsage(sub, childSubs);
	}

	@Get('addresses')
	@UserAccess()
	@SerializeOptions({ type: PublicAddressDto })
	async findMyAddresses(
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicAddressDto[]> {
		return this.addressService.findByUser(user.id);
	}

	@Get('addresses/:type')
	@UserAccess()
	@ApiParam({ name: 'type', enum: AddressType, enumName: 'AddressType' })
	@SerializeOptions({ type: PublicAddressDto })
	async findMyAddress(
		@LoggedIn() user: LoggedInSubject,
		@Param('type') type: AddressType,
	): Promise<PublicAddressDto> {
		return this.addressService.findByUserAndType(user.id, type);
	}

	@Put('addresses/:type')
	@UserAccess()
	@SerializeOptions({ type: PublicAddressDto })
	@ApiParam({ name: 'type', enum: AddressType, enumName: 'AddressType' })
	async changeMyAddress(
		@LoggedIn() user: LoggedInSubject,
		@Param('type') type: AddressType,
		@Body() dto: ChangeMyAddressDto,
	): Promise<PublicAddressDto> {
		if (type === AddressType.Billing || type === AddressType.E911) {
			await this.taxService.checkAddress(dto);
			await this.telcoService.checkAddress(dto);
		}
		return this.addressService.update(user.id, type, dto);
	}

	@Get('wallets')
	@UserAccess()
	@SerializeOptions({ type: PublicWalletDto })
	async findMyWallets(
		@LoggedIn() user: LoggedInSubject,
	): Promise<PublicWalletDto[]> {
		return this.walletService.findByUser(user.id);
	}

	@Post('wallets')
	@UserAccess()
	@SerializeOptions({ type: PublicWalletDto })
	async createMyWallet(
		@LoggedIn() user: LoggedInSubject,
		@Body() dto: CreateMyWalletDto,
	): Promise<PublicWalletDto> {
		const oldWallets = await this.walletService.findByUser(
			user.id,
			dto.provider,
		);
		if (oldWallets.length > 0) {
			throw new BadRequestException('wallet_already_setup');
		}

		const wallet = await this.walletService.create(
			user.id,
			dto.provider,
			dto.address,
			dto.imported,
			dto.readOnly,
		);

		// Immediatly create certificates for all owned phone numbers, but don't wait for completion
		const subs = await this.subService.findByUser(user.id);
		for (const sub of subs) {
			if (!sub.phoneNumberMsisdn) {
				continue;
			}

			this.walletService.createCertificate(
				user.id,
				wallet,
				sub.phoneNumberMsisdn,
			);
		}

		return wallet;
	}

	@Patch('wallets/:walletIdOrAddress')
	@UserAccess()
	@SerializeOptions({ type: PublicWalletDto })
	async updateMyWallet(
		@LoggedIn() user: LoggedInSubject,
		@Param('walletIdOrAddress') walletIdOrAddress: string,
		@Body() dto: UpdateMyWalletDto,
	): Promise<PublicWalletDto> {
		return this.walletService.update(
			user.id,
			walletIdOrAddress,
			dto.cloudBackup ? new Date() : undefined,
			dto.localBackup ? new Date() : undefined,
			dto.readOnly,
		);
	}

	@Get('wallets/:walletIdOrAddress/validate')
	@UserAccess()
	@SerializeOptions({ type: PublicSigningRequestDto })
	async getMySigningRequest(
		@LoggedIn() user: LoggedInSubject,
		@Param('walletIdOrAddress') walletIdOrAddress: string,
	): Promise<PublicSigningRequestDto> {
		return this.walletService.generate(
			user.id,
			walletIdOrAddress,
			walletIdOrAddress,
		);
	}

	@Post('wallets/:walletIdOrAddress/validate')
	@UserAccess()
	@HttpCode(200)
	@SerializeOptions({ type: Boolean })
	async validateMyWallet(
		@LoggedIn() user: LoggedInSubject,
		@Param('walletIdOrAddress') walletIdOrAddress: string,
		@Body() dto: ValidateMyWalletDto,
	): Promise<boolean> {
		return this.walletService.validate(
			user.id,
			walletIdOrAddress,
			dto.message,
			dto.signature,
		);
	}

	@Get('wallets/:walletIdOrAddress/tokens')
	@UserAccess()
	@SerializeOptions({ type: PublicTokenBalanceDto })
	async findMyWalletTokens(
		@LoggedIn() user: LoggedInSubject,
		@Param('walletIdOrAddress') walletIdOrAddress: string,
	): Promise<PublicTokenBalanceDto[]> {
		return this.walletService.getTokens(user.id, walletIdOrAddress);
	}

	@Get('wallets/:walletIdOrAddress/tokens/:token/history')
	@UserAccess()
	@SerializeOptions({ type: PublicTokenHistoryDto })
	@ApiQuery({ name: 'days', required: false })
	async getMyWalletTokenHistory(
		@LoggedIn() user: LoggedInSubject,
		@Param('walletIdOrAddress') walletIdOrAddress: string,
		@Param('token') token: string,
		@Query('days') days?: string,
	): Promise<PublicTokenHistoryDto> {
		const ds = days ? Number(days) : DEFAULT_TOKEN_HISTORY_DAYS;
		const prices = await this.walletService.getTokenHistory(
			user.id,
			walletIdOrAddress,
			token,
			ds,
		);
		return {
			prices,
		};
	}

	@Get('wallets/:walletIdOrAddress/certificates')
	@UserAccess()
	@SerializeOptions({ type: PublicCertificateDto })
	async findMyWalletCertificates(
		@LoggedIn() user: LoggedInSubject,
		@Param('walletIdOrAddress') walletIdOrAddress: string,
	): Promise<PublicCertificateDto[]> {
		return this.walletService.getCertificates(user.id, walletIdOrAddress);
	}

	private toLegacyOrder(order: LegacyOrderInput): PublicOrderWithOfferDto {
		return {
			...order,
			offer: (order.addPlan ?? order.changePlan)?.offer!,
			simSelection: {
				simType: order.addPlan?.simType!,
				iccid: order.addPlan?.simIccid,
			},
			portIn: {
				isPortingIn: order.addPlan?.portIn!,
				msisdn: order.addPlan?.portInMsisdn,
				accountNumber: order.addPlan?.portInAccountNumber,
				password: order.addPlan?.portInPassword,
				postalCode: order.addPlan?.portInPostalCode,
			},
			currentStep: order.currentStep as unknown as PublicOrderStepDto,
		};
	}
}

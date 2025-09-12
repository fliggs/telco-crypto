import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { SimType, Subscription, SubscriptionStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

import { paginate, PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { OfferDto } from '@/offer/dto/graphql/offer.dto';
import { OfferLoader } from '@/offer/offer.loader';
import { OrderFilterDto } from '@/order/dto/request/order-filter.dto';
import { OrderLoader } from '@/order/order.loader';
import { OrderService } from '@/order/order.service';
import { PaginatedOrders } from '@/order/dto/graphql/order.dto';
import { PaginatedPhoneNumberAssignments } from '@/phone-number/dto/graphql/phone-number-assignment.dto';
import { PaginatedSimAssignments } from '@/sim/dto/graphql/sim-assignment.dto';
import { PhoneNumberFilterDto } from '@/phone-number/dto/request/phone-number-filter.dto';
import { PhoneNumberLoader } from '@/phone-number/phone-number.loader';
import { SimFilterDto } from '@/sim/dto/request/sim-filter.dto';
import { SimLoader } from '@/sim/sim.loader';
import { UserDto } from '@/user/dto/graphql/user.dto';
import { UserLoader } from '@/user/user.loader';
import { PaginatedInvoices } from '@/invoice/dto/graphql/invoice.dto';
import { InvoiceFilterDto } from '@/invoice/dto/request/invoice-filter.dto';
import { InvoiceLoader } from '@/invoice/invoice.loader';

import { SubscriptionLoader } from './subscription.loader';
import { SubscriptionService } from './subscription.service';
import { SubscriptionFilterDto } from './dto/request/subscription-filter.dto';
import { SubscriptionPeriodFilterDto } from './dto/request/subscription-period-filter.dto';
import { CreateSubscriptionDto } from './dto/request/create-subscription.dto';
import {
	PaginatedSubscriptions,
	SubscriptionDto,
} from './dto/graphql/subscription.dto';
import {
	PaginatedSubscriptionPeriods,
	SubscriptionPeriodDto,
} from './dto/graphql/subscription-period.dto';

@Resolver(() => SubscriptionDto)
export class SubscriptionResolver {
	constructor(
		private readonly subService: SubscriptionService,
		private readonly orderService: OrderService,
		private readonly subLoader: SubscriptionLoader,
		private readonly offerLoader: OfferLoader,
		private readonly orderLoader: OrderLoader,
		private readonly userLoader: UserLoader,
		private readonly simLoader: SimLoader,
		private readonly phoneNumberLoader: PhoneNumberLoader,
		private readonly invoiceLoader: InvoiceLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedSubscriptions)
	async subscriptions(
		@Args('filter', { type: () => SubscriptionFilterDto, nullable: true })
		filter?: SubscriptionFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedSubscriptions> {
		return this.subService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Query(() => SubscriptionDto)
	async subscription(
		@Args('id', { type: () => String }) id: string,
	): Promise<SubscriptionDto> {
		return this.subService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => SubscriptionDto)
	async createSubscription(
		@Args('sub', { type: () => CreateSubscriptionDto })
		dto: CreateSubscriptionDto,
	) {
		return this.subService.create(dto);
	}

	@AdminAccess()
	@Mutation(() => SubscriptionDto)
	async changeSubscriptionStatus(
		@Args('id', { type: () => String }) id: string,
		@Args('status', { type: () => SubscriptionStatus })
		status: SubscriptionStatus,
	) {
		switch (status) {
			case SubscriptionStatus.ACTIVE: {
				return this.subService.reactivate(id);
			}

			case SubscriptionStatus.CANCELLED: {
				return this.subService.cancel(id);
			}

			case SubscriptionStatus.SUSPENDED: {
				return this.subService.suspend(id);
			}

			case SubscriptionStatus.DEACTIVATED: {
				return this.subService.deactivate(id);
			}

			default: {
				throw new BadRequestException(`invalid_sub_status_change:${status}`);
			}
		}
	}

	@AdminAccess()
	@Mutation(() => SubscriptionDto)
	async changeSubscriptionOffer(
		@Args('id', { type: () => String }) id: string,
		@Args('offerId', { type: () => String })
		offerId: string,
	) {
		return this.subService.changeOffer(id, offerId);
	}

	@AdminAccess()
	@Mutation(() => SubscriptionDto)
	async changeSubscriptionSim(
		@Args('id', { type: () => String }) id: string,
		@Args('simType', { type: () => SimType })
		simType: SimType,
		@Args('iccid', { type: () => String, nullable: true })
		iccid: string | null,
	) {
		return this.orderService.createChangeSim({
			subId: id,
			simType,
			iccid,
		});
	}

	@AdminAccess()
	@Mutation(() => SubscriptionDto)
	async changeSubscriptionPhoneNumber(
		@Args('id', { type: () => String }) id: string,
		@Args('msisdn', { type: () => String, nullable: true })
		msisdn: string | null,
		@Args('ospAccountNumber', { type: () => String, nullable: true })
		ospAccountNumber: string | null,
		@Args('ospPassword', { type: () => String, nullable: true })
		ospPassword: string | null,
		@Args('ospPostalCode', { type: () => String, nullable: true })
		ospPostalCode: string | null,
	) {
		return this.orderService.createChangePhoneNumber({
			subId: id,
			msisdn: msisdn ?? undefined,
			isPortingIn: !!msisdn,
			ospAccountNumber,
			ospPassword,
			ospPostalCode,
		});
	}

	@AdminAccess()
	@ResolveField(() => SubscriptionPeriodDto, { nullable: true })
	async currentPeriod(
		@Parent() sub: Subscription,
	): Promise<SubscriptionPeriodDto | null> {
		return sub.currentPeriodId
			? this.subLoader.periodById.load(sub.currentPeriodId)
			: null;
	}

	@AdminAccess()
	@ResolveField(() => UserDto)
	async user(@Parent() sub: Subscription): Promise<UserDto> {
		return this.userLoader.byId.load(sub.userId);
	}

	@AdminAccess()
	@ResolveField(() => OfferDto)
	async offer(@Parent() sub: Subscription): Promise<OfferDto> {
		return this.offerLoader.byId.load(sub.offerId);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedSubscriptionPeriods)
	async periods(
		@Parent() sub: Subscription,
		@Args('filter', { type: () => SubscriptionPeriodFilterDto, nullable: true })
		filter?: SubscriptionPeriodFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedSubscriptionPeriods> {
		return paginate(
			(take, skip, cursor) =>
				this.subLoader.periodsbySubscriptionPaginated.load([
					sub.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedOrders)
	async orders(
		@Parent() sub: Subscription,
		@Args('filter', { type: () => OrderFilterDto, nullable: true })
		filter?: OrderFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOrders> {
		return paginate(
			(take, skip, cursor) =>
				this.orderLoader.bySubscriptionPaginated.load([
					sub.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedSubscriptions)
	async children(
		@Parent() sub: Subscription,
		@Args('filter', { type: () => SubscriptionFilterDto, nullable: true })
		filter?: SubscriptionFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedSubscriptions> {
		return paginate(
			(take, skip, cursor) =>
				this.subLoader.childrenBySubscriptionPaginated.load([
					sub.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedSimAssignments)
	async sims(
		@Parent() sub: Subscription,
		@Args('filter', { type: () => SimFilterDto, nullable: true })
		filter?: SimFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedSimAssignments> {
		return paginate(
			(take, skip, cursor) =>
				this.simLoader.assignmentsBySubscriptionPaginated.load([
					sub.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedPhoneNumberAssignments)
	async phoneNumbers(
		@Parent() sub: Subscription,
		@Args('filter', { type: () => PhoneNumberFilterDto, nullable: true })
		filter?: PhoneNumberFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedPhoneNumberAssignments> {
		return paginate(
			(take, skip, cursor) =>
				this.phoneNumberLoader.assignmentsBySubscriptionPaginated.load([
					sub.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedInvoices)
	async invoices(
		@Parent() sub: Subscription,
		@Args('filter', { type: () => InvoiceFilterDto, nullable: true })
		filter?: InvoiceFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedInvoices> {
		return paginate(
			(take, skip, cursor) =>
				this.invoiceLoader.bySubscriptionPaginated.load([
					sub.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}
}

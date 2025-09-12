import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { User } from '@prisma/client';

import { paginate, PaginationArgs } from '@/paginated';
import { DecimalNumber, DecimalScalar } from '@/decimal.dto';
import { AuthLoader } from '@/auth/auth.loader';
import { AuthProvider } from '@/auth/dto/internal/auth-strategy.dto';
import { AddressDto } from '@/address/dto/graphql/address.dto';
import { AddressLoader } from '@/address/address.loader';
import { AdminAccess } from '@/auth/access.decorator';
import { BillingLoader } from '@/billing/billing.loader';
import { CreditFilterDto } from '@/credit/dto/request/credit-filter.dto';
import { CreditLoader } from '@/credit/credit.loader';
import { InvoiceFilterDto } from '@/invoice/dto/request/invoice-filter.dto';
import { InvoiceLoader } from '@/invoice/invoice.loader';
import { OnboardingLoader } from '@/onboarding/onboarding.loader';
import { OnboardingProgressDto } from '@/onboarding/dto/graphql/onboarding-progress.dto';
import { OrderFilterDto } from '@/order/dto/request/order-filter.dto';
import { OrderLoader } from '@/order/order.loader';
import { PaginatedCredits } from '@/credit/dto/graphql/credit.dto';
import { PaginatedInvoices } from '@/invoice/dto/graphql/invoice.dto';
import { PaginatedOrders } from '@/order/dto/graphql/order.dto';
import { PaginatedSubscriptions } from '@/subscription/dto/graphql/subscription.dto';
import { PaginatedWallets } from '@/wallet/dto/graphql/wallet.dto';
import { SubscriptionFilterDto } from '@/subscription/dto/request/subscription-filter.dto';
import { SubscriptionLoader } from '@/subscription/subscription.loader';
import { UserBillingDataDto } from '@/billing/dto/graphql/user-billing-data.dto';
import { WalletFilterDto } from '@/wallet/dto/request/wallet-filter.dto';
import { CreditService } from '@/credit/credit.service';
import { WalletLoader } from '@/wallet/wallet.loader';

import { UserService } from './user.service';
import { UserGroupLoader } from './group.loader';
import { UserFilterDto } from './dto/request/user-filter.dto';
import { PaginatedUsers, UserDto } from './dto/graphql/user.dto';
import { UserGroupDto } from './dto/graphql/group.dto';
import { UserAuthDataDto } from './dto/graphql/auth-data.dto';
import { UserOrderByDto } from './dto/request/user-order-by.dto';

@Resolver(() => UserDto)
export class UserResolver {
	constructor(
		private readonly userService: UserService,
		private readonly orderLoader: OrderLoader,
		private readonly subLoader: SubscriptionLoader,
		private readonly walletLoader: WalletLoader,
		private readonly invoiceLoader: InvoiceLoader,
		private readonly creditLoader: CreditLoader,
		private readonly addressLoader: AddressLoader,
		private readonly onboardingLoader: OnboardingLoader,
		private readonly billingLoader: BillingLoader,
		private readonly authLoader: AuthLoader,
		private readonly groupLoader: UserGroupLoader,
		private readonly creditService: CreditService,
	) {}

	@AdminAccess()
	@Query(() => PaginatedUsers)
	async users(
		@Args('filter', { type: () => UserFilterDto, nullable: true })
		filter?: UserFilterDto,
		@Args('orderBy', { type: () => [UserOrderByDto], nullable: true })
		orderBy?: UserOrderByDto[],
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedUsers> {
		return this.userService.findAll(filter, orderBy, pagination);
	}

	@AdminAccess()
	@Query(() => UserDto)
	async user(@Args('id', { type: () => String }) id: string): Promise<UserDto> {
		return this.userService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => UserDto)
	async createUser(
		@Args('email') email: string,
		@Args('firstName') firstName: string,
		@Args('lastName') lastName: string,
	): Promise<UserDto> {
		return this.userService.create({
			email,
			firstName,
			lastName,
		});
	}

	@AdminAccess()
	@Mutation(() => UserDto)
	async deleteUser(@Args('id') id: string): Promise<UserDto> {
		return this.userService.delete(id);
	}

	@AdminAccess()
	@Mutation(() => UserDto)
	async changeUserGroup(
		@Args('id') id: string,
		@Args('groupId', { type: () => String, nullable: true })
		groupId: string | null,
	): Promise<UserDto> {
		return this.userService.update(id, { groupId });
	}

	@AdminAccess()
	@Mutation(() => UserDto)
	async reactivateUser(@Args('id') id: string): Promise<UserDto> {
		return this.userService.reactivate(id);
	}

	@AdminAccess()
	@ResolveField(() => UserGroupDto, { nullable: true })
	async group(@Parent() user: User): Promise<UserGroupDto | null> {
		return user.groupId ? this.groupLoader.byId.load(user.groupId) : null;
	}

	@AdminAccess()
	@ResolveField(() => [AddressDto])
	async addresses(@Parent() user: User): Promise<AddressDto[]> {
		const addrs = await this.addressLoader.byUser.load(user.id);
		console.log(addrs);
		return addrs;
	}

	@AdminAccess()
	@ResolveField(() => [OnboardingProgressDto])
	async onboardingProgress(
		@Parent() user: User,
	): Promise<OnboardingProgressDto[]> {
		return this.onboardingLoader.progressByUser.load(user.id);
	}

	@AdminAccess()
	@ResolveField(() => [UserBillingDataDto])
	async billingData(@Parent() user: User): Promise<UserBillingDataDto[]> {
		return this.billingLoader.userDataByUser.load(user.id);
	}

	@AdminAccess()
	@ResolveField(() => [UserAuthDataDto])
	async authData(@Parent() user: User): Promise<UserAuthDataDto[]> {
		const data = await this.authLoader.userDataByUser.load(user.id);
		return data.map((data) => ({
			...data,
			provider: data.provider as AuthProvider,
		}));
	}

	@AdminAccess()
	@ResolveField(() => PaginatedOrders)
	async orders(
		@Parent() user: User,
		@Args('filter', { type: () => OrderFilterDto, nullable: true })
		filter?: OrderFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOrders> {
		return paginate(
			(take, skip, cursor) =>
				this.orderLoader.byUserPaginated.load([
					user.id,
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
	async subscriptions(
		@Parent() user: User,
		@Args('filter', { type: () => SubscriptionFilterDto, nullable: true })
		filter?: SubscriptionFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedSubscriptions> {
		return paginate(
			(take, skip, cursor) =>
				this.subLoader.byUserPaginated.load([
					user.id,
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
	@ResolveField(() => PaginatedWallets)
	async wallets(
		@Parent() user: User,
		@Args('filter', { type: () => WalletFilterDto, nullable: true })
		filter?: WalletFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedWallets> {
		return paginate(
			(take, skip, cursor) =>
				this.walletLoader.byUserPaginated.load([
					user.id,
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
		@Parent() user: User,
		@Args('filter', { type: () => InvoiceFilterDto, nullable: true })
		filter?: InvoiceFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedInvoices> {
		return paginate(
			(take, skip, cursor) =>
				this.invoiceLoader.byUserPaginated.load([
					user.id,
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
	@ResolveField(() => PaginatedCredits)
	async credits(
		@Parent() user: User,
		@Args('filter', { type: () => CreditFilterDto, nullable: true })
		filter?: CreditFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedCredits> {
		return paginate(
			(take, skip, cursor) =>
				this.creditLoader.byUserPaginated.load([
					user.id,
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
	@ResolveField(() => DecimalScalar)
	async creditBalance(@Parent() user: User): Promise<DecimalNumber> {
		return this.creditService.computeUserCreditBalance(user.id);
	}
}

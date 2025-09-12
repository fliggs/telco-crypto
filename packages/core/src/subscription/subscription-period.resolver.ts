import {
	Args,
	Mutation,
	Parent,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';
import { OrderDto, PaginatedOrders } from '@/order/dto/graphql/order.dto';
import { SubscriptionPeriod } from '@prisma/client';
import { OrderFilterDto } from '@/order/dto/request/order-filter.dto';
import { paginate, PaginationArgs } from '@/paginated';
import { OrderLoader } from '@/order/order.loader';

import { SubscriptionService } from './subscription.service';
import { SubscriptionPeriodDto } from './dto/graphql/subscription-period.dto';

@Resolver(() => SubscriptionPeriodDto)
export class SubscriptionPeriodResolver {
	constructor(
		private readonly subService: SubscriptionService,
		private readonly orderLoader: OrderLoader,
	) {}

	@AdminAccess()
	@Mutation(() => SubscriptionPeriodDto)
	async rerunPeriod(@Args('id', { type: () => String }) id: string) {
		const period = await this.subService.findPeriodSimple(id);
		return this.subService.rerunPeriod(period.subscriptionId, period.id);
	}

	@AdminAccess()
	@ResolveField(() => OrderDto, { nullable: true })
	async newestOrder(
		@Parent() period: SubscriptionPeriod,
	): Promise<OrderDto | null> {
		const orders = await this.orderLoader.bySubscriptionPeriodPaginated.load([
			period.id,
			undefined,
			1,
			0,
			null,
		]);
		return orders.length > 0 ? orders[0] : null;
	}

	@AdminAccess()
	@ResolveField(() => PaginatedOrders)
	async orders(
		@Parent() period: SubscriptionPeriod,
		@Args('filter', { type: () => OrderFilterDto, nullable: true })
		filter?: OrderFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOrders> {
		return paginate(
			(take, skip, cursor) =>
				this.orderLoader.bySubscriptionPeriodPaginated.load([
					period.id,
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

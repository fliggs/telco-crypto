import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Order, OrderType } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

import { paginate, PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { InvoiceLoader } from '@/invoice/invoice.loader';
import { PaginatedInvoices } from '@/invoice/dto/graphql/invoice.dto';
import { InvoiceFilterDto } from '@/invoice/dto/request/invoice-filter.dto';
import { UserDto } from '@/user/dto/graphql/user.dto';
import { UserLoader } from '@/user/user.loader';

import { OrderDto, PaginatedOrders } from './dto/graphql/order.dto';
import { OrderLoader } from './order.loader';
import { OrderService } from './order.service';
import { OrderStepLoader } from './order-step.loader';
import { OrderFilterDto } from './dto/request/order-filter.dto';
import { CreateOrderDto } from './dto/request/create-order.dto';
import { OrderAddPlanDetailsDto } from './dto/graphql/order-add-plan.dto';
import { OrderRunDto } from './dto/graphql/order-run.dto';
import { OrderRenewPlanDetailsDto } from './dto/graphql/order-renew-plan.dto';
import { OrderRunLoader } from './order-run.loader';
import { OrderStepDto } from './dto/graphql/order-step.dto';
import { OrderChangePlanDetailsDto } from './dto/graphql/order-change-plan.dto';
import { OrderChangeSimDetailsDto } from './dto/graphql/order-change-sim.dto';
import { OrderChangePhoneNumberDetailsDto } from './dto/graphql/order-change-phone-number.dto';
import { OrderPortOutDetailsDto } from './dto/graphql/order-port-out.dto';
import { OrderOrderByDto } from './dto/request/order-order-by.dto';

@Resolver(() => OrderDto)
export class OrderResolver {
	constructor(
		private readonly orderService: OrderService,
		private readonly orderLoader: OrderLoader,
		private readonly orderStepLoader: OrderStepLoader,
		private readonly invoiceLoader: InvoiceLoader,
		private readonly userLoader: UserLoader,
		private readonly orderRunLoader: OrderRunLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedOrders)
	async orders(
		@Args('filter', { type: () => OrderFilterDto, nullable: true })
		filter?: OrderFilterDto,
		@Args('orderBy', { type: () => [OrderOrderByDto], nullable: true })
		orderBy?: OrderOrderByDto[],
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOrders> {
		return this.orderService.findAll(filter, orderBy, pagination);
	}

	@AdminAccess()
	@Query(() => OrderDto)
	async order(
		@Args('id', { type: () => String })
		id: string,
	): Promise<OrderDto> {
		return this.orderService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => OrderDto)
	async createOrder(
		@Args('order', { type: () => CreateOrderDto })
		dto: CreateOrderDto,
	) {
		switch (dto.type) {
			case OrderType.PORT_OUT: {
				if (!dto.subscriptionId) {
					throw new BadRequestException('missing_subscription_id');
				}

				return this.orderService.createPortOut({
					userId: dto.userId,
					subId: dto.subscriptionId,
				});
			}

			default: {
				throw new BadRequestException(`unsupported_order_type:${dto.type}`);
			}
		}
	}

	@AdminAccess()
	@Mutation(() => OrderDto)
	async retryOrder(
		@Args('id', { type: () => String })
		id: string,
	): Promise<OrderDto> {
		return this.orderService.retry(id);
	}

	@AdminAccess()
	@Mutation(() => OrderDto)
	async abortOrder(
		@Args('id', { type: () => String })
		id: string,
	): Promise<OrderDto> {
		return this.orderService.abort(id);
	}

	@AdminAccess()
	@Mutation(() => OrderDto)
	async markOrderShipped(
		@Args('id', { type: () => String })
		id: string,
	): Promise<OrderDto> {
		return this.orderService.markShippingComplete(id);
	}

	@AdminAccess()
	@ResolveField(() => UserDto)
	async user(@Parent() order: Order): Promise<UserDto> {
		return this.userLoader.byId.load(order.userId);
	}

	@AdminAccess()
	@ResolveField(() => OrderAddPlanDetailsDto, { nullable: true })
	async addPlan(
		@Parent() order: Order,
	): Promise<OrderAddPlanDetailsDto | null> {
		return this.orderLoader.addPlanDetailsByOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => OrderRenewPlanDetailsDto, { nullable: true })
	async renewPlan(
		@Parent() order: Order,
	): Promise<OrderRenewPlanDetailsDto | null> {
		return this.orderLoader.renewPlanDetailsByOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => OrderChangePlanDetailsDto, { nullable: true })
	async changePlan(
		@Parent() order: Order,
	): Promise<OrderChangePlanDetailsDto | null> {
		return this.orderLoader.changePlanDetailsByOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => OrderChangeSimDetailsDto, { nullable: true })
	async changeSim(
		@Parent() order: Order,
	): Promise<OrderChangeSimDetailsDto | null> {
		return this.orderLoader.changeSimDetailsByOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => OrderChangePhoneNumberDetailsDto, { nullable: true })
	async changePhoneNumber(
		@Parent() order: Order,
	): Promise<OrderChangePhoneNumberDetailsDto | null> {
		return this.orderLoader.changePhoneNumberDetailsByOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => OrderPortOutDetailsDto, { nullable: true })
	async portOut(
		@Parent() order: Order,
	): Promise<OrderPortOutDetailsDto | null> {
		return this.orderLoader.portOutDetailsByOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => PaginatedInvoices)
	async invoices(
		@Parent() order: Order,
		@Args('filter', { type: () => InvoiceFilterDto, nullable: true })
		filter?: InvoiceFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedInvoices> {
		return paginate(
			(take, skip, cursor) =>
				this.invoiceLoader.byOrderPaginated.load([
					order.id,
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
	@ResolveField(() => OrderStepDto, { nullable: true })
	async currentStep(@Parent() order: Order): Promise<OrderStepDto | null> {
		return typeof order.stepNo === 'number'
			? this.orderStepLoader.currentByOrderId.load([order.id, order.stepNo])
			: null;
	}

	@AdminAccess()
	@ResolveField(() => [OrderStepDto])
	async steps(@Parent() order: Order): Promise<OrderStepDto[]> {
		return this.orderStepLoader.byOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => OrderRunDto, { nullable: true })
	async newestRun(@Parent() order: Order): Promise<OrderRunDto | null> {
		return this.orderRunLoader.newestByOrderId.load(order.id);
	}

	@AdminAccess()
	@ResolveField(() => [OrderRunDto])
	async runs(@Parent() order: Order): Promise<OrderRunDto[]> {
		return this.orderRunLoader.byOrderId.load(order.id);
	}
}

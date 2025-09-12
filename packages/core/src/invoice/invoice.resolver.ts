import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { Invoice } from '@prisma/client';

import { PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { OrderDto } from '@/order/dto/graphql/order.dto';
import { OrderLoader } from '@/order/order.loader';

import { InvoiceService } from './invoice.service';
import { InvoiceDto, PaginatedInvoices } from './dto/graphql/invoice.dto';
import { InvoiceFilterDto } from './dto/request/invoice-filter.dto';
import { InvoiceItemDto } from './dto/graphql/invoice-item.dto';
import { InvoiceLoader } from './invoice.loader';
import { InvoiceOrderByDto } from './dto/request/invoice-order-by.dto';

@Resolver(() => InvoiceDto)
export class InvoiceResolver {
	constructor(
		private readonly invoiceService: InvoiceService,
		private readonly invoiceLoader: InvoiceLoader,
		private readonly orderLoader: OrderLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedInvoices)
	async invoices(
		@Args('filter', { type: () => InvoiceFilterDto, nullable: true })
		filter?: InvoiceFilterDto,
		@Args('orderBy', { type: () => [InvoiceOrderByDto], nullable: true })
		orderBy?: InvoiceOrderByDto[],
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedInvoices> {
		return this.invoiceService.findAll(filter, orderBy, pagination);
	}

	@AdminAccess()
	@Query(() => InvoiceDto)
	async invoice(@Args('id') id: string): Promise<InvoiceDto> {
		return this.invoiceService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => InvoiceDto)
	async refundInvoice(
		@Args('id', { type: () => String }) id: string,
		@Args('asCredits', { type: () => Boolean }) asCredits: boolean,
	) {
		return this.invoiceService.refund(id, asCredits);
	}

	@AdminAccess()
	@ResolveField(() => OrderDto)
	async order(@Parent() invoice: Invoice): Promise<OrderDto> {
		return this.orderLoader.byId.load(invoice.orderId);
	}

	@AdminAccess()
	@ResolveField(() => [InvoiceItemDto])
	async items(@Parent() invoice: Invoice): Promise<InvoiceItemDto[]> {
		return this.invoiceLoader.itemsByInvoiceIds.load(invoice.id);
	}
}

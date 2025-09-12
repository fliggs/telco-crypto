import { Injectable, Scope } from '@nestjs/common';
import { Invoice, InvoiceItem } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { PaginatedLoad } from '@/paginated';

import { InvoiceService } from './invoice.service';
import { InvoiceFilterDto } from './dto/request/invoice-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class InvoiceLoader {
	constructor(private readonly invoiceService: InvoiceService) {}

	public readonly byUserPaginated = new DataLoader<
		PaginatedLoad<string, InvoiceFilterDto>,
		Invoice[]
	>(async (keys: readonly PaginatedLoad<string, InvoiceFilterDto>[]) => {
		const map = await this.invoiceService.mapByUserIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly byOrderPaginated = new DataLoader<
		PaginatedLoad<string, InvoiceFilterDto>,
		Invoice[]
	>(async (keys: readonly PaginatedLoad<string, InvoiceFilterDto>[]) => {
		const map = await this.invoiceService.mapByOrderIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly bySubscriptionPaginated = new DataLoader<
		PaginatedLoad<string, InvoiceFilterDto>,
		Invoice[]
	>(async (keys: readonly PaginatedLoad<string, InvoiceFilterDto>[]) => {
		const map = await this.invoiceService.mapBySubscriptionIdsPaginated([
			...keys,
		]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly itemsByInvoiceIds = new DataLoader<string, InvoiceItem[]>(
		async (keys: readonly string[]) => {
			const map = await this.invoiceService.mapItemsByInvoiceIds([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);
}

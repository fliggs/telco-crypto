import { Expose, Type } from 'class-transformer';

import { Decimal, DecimalNumber } from '@/decimal.dto';
import { PublicOrderWithSubscriptionDto } from '@/order/dto/response/public-order+subscription.dto';

import { PublicInvoiceItemDto } from './public-invoice-item.dto';

export class PublicInvoiceWithOrderAndItemsDto {
	@Expose()
	id: string;

	@Expose()
	invoicedAt: Date;

	@Decimal()
	totalCost: DecimalNumber;

	@Expose()
	@Type(() => PublicInvoiceItemDto)
	items: PublicInvoiceItemDto[];

	@Expose()
	@Type(() => PublicOrderWithSubscriptionDto)
	order: PublicOrderWithSubscriptionDto;
}

import { Expose } from 'class-transformer';

import { Decimal, DecimalNumber } from '@/decimal.dto';

export class PublicInvoiceItemDto {
	@Expose()
	name: string;

	@Expose()
	title: string;

	@Expose()
	description: string;

	@Expose()
	amount: number;

	@Decimal()
	costPerItem: DecimalNumber;

	@Decimal()
	totalCost: DecimalNumber;

	constructor(partial: Partial<PublicInvoiceItemDto>) {
		Object.assign(this, partial);
	}
}

import { Expose } from 'class-transformer';

import { Decimal, DecimalNumber } from '@/decimal.dto';

export class PublicTaxItemDto {
	@Expose()
	id: string;

	@Expose()
	name: string;

	@Expose()
	title: string;

	@Expose()
	description: string;

	@Decimal()
	cost: DecimalNumber;

	@Expose()
	tags: string[];

	constructor(partial: Partial<PublicTaxItemDto>) {
		Object.assign(this, partial);
	}
}

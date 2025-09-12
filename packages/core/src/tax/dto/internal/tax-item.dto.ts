import { DecimalNumber } from '@/decimal.dto';

export interface TaxItemDto {
	id: string;
	name: string;
	title: string;
	description: string;
	cost: DecimalNumber;
	tags: string[];
}

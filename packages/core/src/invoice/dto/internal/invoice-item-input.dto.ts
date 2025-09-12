import { DecimalNumber } from '@/decimal.dto';

export interface InvoiceItemInputDto {
	name: string;
	title: string;
	description: string;
	amount: number;
	costPerItem: DecimalNumber | number | string;
	totalCost: DecimalNumber | number | string;
}

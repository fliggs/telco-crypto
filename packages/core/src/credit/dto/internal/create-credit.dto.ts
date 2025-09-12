import { DecimalNumber } from '@/decimal.dto';

export interface CreateCreditDto {
	title: string;
	userId: string;
	subscriptionId?: string | null;
	providedCost: DecimalNumber;
}

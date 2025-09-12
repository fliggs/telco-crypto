import { Prisma } from '@prisma/client';

export interface CreditUsageDto {
	orderId: string;
	creditId: string;
	invoiceId: string;
	usedCost: Prisma.Decimal;
	oldUsedCost: Prisma.Decimal;
}

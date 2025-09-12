import { InvoiceStatus } from '@prisma/client';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { Paginated } from '@/paginated';
import { DecimalNumber, DecimalScalar } from '@/decimal.dto';

registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });

@ObjectType()
export class InvoiceDto {
	@Field()
	id: string;

	@Field(() => InvoiceStatus)
	status: InvoiceStatus;

	@Field()
	invoicedAt: Date;

	@Field(() => DecimalScalar)
	totalCost: DecimalNumber;

	@Field()
	orderId: string;
}

@ObjectType()
export class PaginatedInvoices extends Paginated(InvoiceDto) {}

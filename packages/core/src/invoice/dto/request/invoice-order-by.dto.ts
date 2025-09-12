import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { Prisma } from '@prisma/client';

export enum InvoiceOrderByColumn {
	createdAt = 'createdAt',
	invoicedAt = 'invoicedAt',
	totalCost = 'totalCost',
}

registerEnumType(InvoiceOrderByColumn, { name: 'InvoiceOrderByColumn' });
registerEnumType(Prisma.SortOrder, { name: 'SortOrder' });

@InputType()
export class InvoiceOrderByDto {
	@Field(() => InvoiceOrderByColumn)
	@IsEnum(InvoiceOrderByColumn)
	col: InvoiceOrderByColumn;

	@Field(() => Prisma.SortOrder)
	@IsEnum(Prisma.SortOrder)
	dir: Prisma.SortOrder;
}

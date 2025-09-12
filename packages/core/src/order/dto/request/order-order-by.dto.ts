import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { Prisma } from '@prisma/client';

export enum OrderOrderByColumn {
	createdAt = 'createdAt',
	updatedAt = 'updatedAt',
	startedAt = 'startedAt',
	confirmedAt = 'confirmedAt',
	completedAt = 'completedAt',
	runAt = 'runAt',
}

registerEnumType(OrderOrderByColumn, { name: 'OrderOrderByColumn' });
registerEnumType(Prisma.SortOrder, { name: 'SortOrder' });

@InputType()
export class OrderOrderByDto {
	@Field(() => OrderOrderByColumn)
	@IsEnum(OrderOrderByColumn)
	col: OrderOrderByColumn;

	@Field(() => Prisma.SortOrder)
	@IsEnum(Prisma.SortOrder)
	dir: Prisma.SortOrder;
}

import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { IsEnum } from 'class-validator';
import { Prisma } from '@prisma/client';

export enum UserOrderByColumn {
	createdAt = 'createdAt',
	email = 'email',
	firstName = 'firstName',
	lastName = 'lastName',
}

registerEnumType(UserOrderByColumn, { name: 'UserOrderByColumn' });
registerEnumType(Prisma.SortOrder, { name: 'SortOrder' });

@InputType()
export class UserOrderByDto {
	@Field(() => UserOrderByColumn)
	@IsEnum(UserOrderByColumn)
	col: UserOrderByColumn;

	@Field(() => Prisma.SortOrder)
	@IsEnum(Prisma.SortOrder)
	dir: Prisma.SortOrder;
}

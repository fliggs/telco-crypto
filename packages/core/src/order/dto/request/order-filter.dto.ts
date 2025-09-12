import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { OrderStatus, OrderType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

registerEnumType(OrderType, { name: 'OrderType' });
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType()
export class OrderFilterDto {
	@IsEnum(OrderType)
	@IsOptional()
	@Field(() => OrderType, { nullable: true })
	type?: OrderType;

	@IsEnum(OrderStatus)
	@IsOptional()
	@Field(() => OrderStatus, { nullable: true })
	status?: OrderStatus;

	@IsInt()
	@IsOptional()
	@Field(() => Int, { nullable: true })
	step?: number;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	stepType?: string;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	email?: string;
}

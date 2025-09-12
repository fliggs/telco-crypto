import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { OrderType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

registerEnumType(OrderType, { name: 'OrderType' });

@InputType()
export class CreateOrderDto {
	@IsEnum(OrderType)
	@Field(() => OrderType)
	type: OrderType;

	@IsUUID()
	@Field()
	userId: string;

	@IsUUID()
	@IsOptional()
	@Field(() => String, { nullable: true })
	subscriptionId?: string | null;
}

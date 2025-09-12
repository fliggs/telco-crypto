import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateMyOrderDto {
	@IsEnum(OrderType)
	@ApiProperty({ enum: OrderType, enumName: 'OrderType' })
	type: OrderType;

	@IsUUID()
	@IsOptional()
	offerId?: string;

	@IsUUID()
	@IsOptional()
	promoCodeId?: string;

	@IsUUID()
	@IsOptional()
	subscriptionId?: string;
}

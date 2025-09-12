import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, OrderType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { PublicSubscriptionWithOfferDto } from '@/subscription/dto/response/public-subscription+offer.dto';

export class PublicOrderWithSubscriptionDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enum: OrderType, enumName: 'OrderType' })
	type: OrderType;

	@Expose()
	@ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
	status: OrderStatus;

	@Expose()
	startedAt: Date | null;

	@Expose()
	completedAt: Date | null;

	@Expose()
	subscriptionId: string | null;

	@Expose()
	@Type(() => PublicSubscriptionWithOfferDto)
	subscription: PublicSubscriptionWithOfferDto | null;
}

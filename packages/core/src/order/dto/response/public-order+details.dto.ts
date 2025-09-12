import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, OrderType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { PublicOfferWithPlanDto } from '@/offer/dto/response/public-offer+plan.dto';
import { PublicSubscriptionDto } from '@/subscription/dto/response/public-subscription.dto';

import { PublicOrderStepDto } from './public-order-step.dto';
import { PublicOrderSigningDto } from './public-order-signing.dto';

export class PublicOrderWithDetailsDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enum: OrderType, enumName: 'OrderType' })
	type: OrderType;

	@Expose()
	@ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
	status: OrderStatus;

	@Expose()
	stepNo: number | null;

	@Expose()
	startedAt: Date | null;

	@Expose()
	completedAt: Date | null;

	@Expose()
	@Type(() => PublicOrderStepDto)
	currentStep: PublicOrderStepDto | null;

	@Expose()
	@Type(() => PublicOfferWithPlanDto)
	offer: PublicOfferWithPlanDto | null;

	@Expose()
	@Type(() => PublicSubscriptionDto)
	subscription: PublicSubscriptionDto | null;

	@Expose()
	@Type(() => PublicOrderSigningDto)
	signing: PublicOrderSigningDto | null;

	@Expose()
	subscriptionId: string | null;
}

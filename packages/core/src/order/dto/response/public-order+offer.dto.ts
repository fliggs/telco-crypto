import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, OrderType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { PublicOfferWithPlanDto } from '@/offer/dto/response/public-offer+plan.dto';

import { PublicPortInDataDto } from './public-port-in-data.dto';
import { PublicSimSelectionDataDto } from './public-sim-selection-data.dto';
import { PublicOrderStepDto } from './public-order-step.dto';

export class PublicOrderWithOfferDto {
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
	@Type(() => PublicOrderStepDto)
	currentStep: PublicOrderStepDto | null;

	@Expose()
	@Type(() => PublicSimSelectionDataDto)
	simSelection: PublicSimSelectionDataDto | null;

	@Expose()
	@Type(() => PublicPortInDataDto)
	portIn: PublicPortInDataDto | null;

	@Expose()
	@Type(() => PublicOfferWithPlanDto)
	offer: PublicOfferWithPlanDto | null;

	@Expose()
	subscriptionId: string | null;
}

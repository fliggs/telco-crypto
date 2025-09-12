import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { PublicOfferWithPlanDto } from '@/offer/dto/response/public-offer+plan.dto';

import { PublicSubscriptionPeriodDto } from './public-subscription-period.dto';

export class PublicSubscriptionWithOfferDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enumName: 'SubscriptionStatus', enum: SubscriptionStatus })
	status: SubscriptionStatus;

	@Expose()
	parentId: string | null;

	@Expose()
	label: string | null;

	@Expose()
	phoneNumberMsisdn: string | null;

	@Expose()
	simIccid: string | null;

	@Expose()
	userId: string;

	@Expose()
	@Type(() => PublicSubscriptionPeriodDto)
	currentPeriod: PublicSubscriptionPeriodDto | null;

	@Expose()
	@Type(() => PublicOfferWithPlanDto)
	offer: PublicOfferWithPlanDto;
}

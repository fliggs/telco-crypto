import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPeriodStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { PublicOfferWithPlanDto } from '@/offer/dto/response/public-offer+plan.dto';

export class PublicSubscriptionPeriodWithOfferDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({
		enum: SubscriptionPeriodStatus,
		enumName: 'SubscriptionPeriodStatus',
	})
	status: SubscriptionPeriodStatus;

	@Expose()
	@Type(() => Date)
	startsAt: Date;

	@Expose()
	@Type(() => Date)
	endsAt: Date;

	@Expose()
	offerId: string;

	@Expose()
	@Type(() => PublicOfferWithPlanDto)
	offer: PublicOfferWithPlanDto;
}

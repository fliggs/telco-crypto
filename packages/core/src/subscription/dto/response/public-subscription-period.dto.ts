import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionPeriodStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class PublicSubscriptionPeriodDto {
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
}

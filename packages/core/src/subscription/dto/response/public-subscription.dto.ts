import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class PublicSubscriptionDto {
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
}

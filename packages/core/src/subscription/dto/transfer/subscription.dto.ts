import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SubscriptionDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enum: SubscriptionStatus, enumName: 'SubscriptionStatus' })
	status: SubscriptionStatus;

	@Expose()
	userId: string;
}

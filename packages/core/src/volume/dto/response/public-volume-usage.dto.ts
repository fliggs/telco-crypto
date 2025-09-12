import { ApiProperty } from '@nestjs/swagger';
import { VolumeType } from '@prisma/client';
import { Expose } from 'class-transformer';

import { Decimal, DecimalNumber } from '@/decimal.dto';

export class PublicVolumeUsageDto {
	@Expose()
	@ApiProperty({ enum: VolumeType, enumName: 'VolumeType' })
	type: VolumeType;

	@Expose()
	isUnlimited: boolean;

	@Expose()
	isRoaming: boolean;

	@Decimal()
	amountTotal: DecimalNumber;

	@Decimal()
	amountUsed: DecimalNumber;

	@Expose()
	subscriptionId?: string;
}

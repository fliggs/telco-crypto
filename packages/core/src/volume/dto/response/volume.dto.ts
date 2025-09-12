import { ApiProperty } from '@nestjs/swagger';
import { VolumeType } from '@prisma/client';
import { Expose } from 'class-transformer';

import { Decimal, DecimalNumber } from '@/decimal.dto';

export class VolumeDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enum: VolumeType, enumName: 'VolumeType' })
	type: VolumeType;

	@Expose()
	isUnlimited: boolean;

	@Expose()
	isRoaming: boolean;

	@Decimal()
	amount: DecimalNumber;

	constructor(partial: Partial<VolumeDto>) {
		Object.assign(this, partial);
	}
}

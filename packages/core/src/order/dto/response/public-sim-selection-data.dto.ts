import { ApiProperty } from '@nestjs/swagger';
import { SimType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class PublicSimSelectionDataDto {
	@Expose()
	@ApiProperty({ enum: SimType, enumName: 'SimType' })
	simType: SimType;

	@Expose()
	iccid?: string | null;
}

import { ApiProperty } from '@nestjs/swagger';
import { SimType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class PublicSimDto {
	@Expose()
	iccid: string;

	@Expose()
	@ApiProperty({ enum: SimType, enumName: 'SimType' })
	type: SimType;
}

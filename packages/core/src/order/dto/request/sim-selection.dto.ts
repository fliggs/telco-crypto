import { ApiProperty } from '@nestjs/swagger';
import { SimType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class SimSelectionDto {
	@IsEnum(SimType)
	@ApiProperty({ enum: SimType, enumName: 'SimType' })
	simType: SimType;

	@IsString()
	@IsOptional()
	iccid?: string;
}

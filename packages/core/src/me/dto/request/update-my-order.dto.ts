import { ApiProperty } from '@nestjs/swagger';
import { SimType } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateMyOrderDto {
	@IsString()
	@IsOptional()
	offerId?: string;

	@IsBoolean()
	@IsOptional()
	isPortingIn?: boolean;

	@IsString()
	@IsOptional()
	postalCode?: string;

	@IsString()
	@IsOptional()
	msisdn?: string;

	@IsString()
	@IsOptional()
	ospAccountNumber?: string;

	@IsString()
	@IsOptional()
	ospPassword?: string;

	@IsOptional()
	@IsEnum(SimType)
	@ApiProperty({ enum: SimType, enumName: 'SimType' })
	simType?: SimType;

	@IsString()
	@IsOptional()
	simIccid?: string;

	@IsBoolean()
	@IsOptional()
	confirm?: boolean;
}

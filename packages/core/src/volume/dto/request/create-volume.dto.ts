import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { VolumeType } from '@prisma/client';
import { IsBoolean, IsDecimal, IsEnum } from 'class-validator';

registerEnumType(VolumeType, { name: 'VolumeType' });

@InputType()
export class CreateVolumeDto {
	@IsEnum(VolumeType)
	@ApiProperty({ enum: VolumeType, enumName: 'VolumeType' })
	@Field(() => VolumeType)
	type: VolumeType;

	@IsBoolean()
	@Field()
	isUnlimited: boolean;

	@IsBoolean()
	@Field()
	isRoaming: boolean;

	@IsDecimal()
	@Field()
	amount: string;
}

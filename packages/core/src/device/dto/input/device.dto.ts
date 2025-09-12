import { Field, InputType } from '@nestjs/graphql';
import { DeviceType } from '@prisma/client';
import { IsBoolean, IsEnum, IsString } from 'class-validator';

@InputType()
export class DeviceInputDto {
	@IsString()
	@Field()
	name: string;

	@IsEnum(DeviceType)
	@Field(() => DeviceType)
	type: DeviceType;

	@IsBoolean()
	@Field()
	eSimSupport: boolean;
}

import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { SimStatus, SimType } from '@prisma/client';
import {
	IsEnum,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

registerEnumType(SimType, { name: 'SimType' });
registerEnumType(SimStatus, { name: 'SimStatus' });

@InputType()
export class CreateSimDto {
	@IsEnum(SimType)
	@ApiProperty({ enum: SimType, enumName: 'SimType' })
	@Field(() => SimType)
	type: SimType;

	@IsEnum(SimStatus)
	@ApiProperty({ enum: SimStatus, enumName: 'SimStatus' })
	@Field(() => SimStatus)
	status: SimStatus;

	@IsString()
	@MinLength(19)
	@MaxLength(20)
	@IsOptional()
	@Field(() => String, { nullable: true })
	iccid?: string | null;

	@IsString()
	@MinLength(19)
	@MaxLength(20)
	@IsOptional()
	@Field(() => String, { nullable: true })
	firstIccid?: string | null;

	@IsString()
	@MinLength(19)
	@MaxLength(20)
	@IsOptional()
	@Field(() => String, { nullable: true })
	lastIccid?: string | null;
}

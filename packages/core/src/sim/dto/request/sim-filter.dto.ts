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
export class SimFilterDto {
	@IsString()
	@MaxLength(20)
	@IsOptional()
	@Field({ nullable: true })
	iccid?: string;

	@IsEnum(SimType)
	@IsOptional()
	@ApiProperty({ enum: SimType, enumName: 'SimType' })
	@Field(() => SimType, { nullable: true })
	type?: SimType;

	@IsEnum(SimStatus)
	@IsOptional()
	@ApiProperty({ enum: SimStatus, enumName: 'SimStatus' })
	@Field(() => SimStatus, { nullable: true })
	status?: SimStatus;
}

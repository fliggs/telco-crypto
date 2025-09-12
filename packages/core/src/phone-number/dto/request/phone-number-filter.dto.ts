import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumberSource, PhoneNumberStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

registerEnumType(PhoneNumberSource, { name: 'PhoneNumberSource' });
registerEnumType(PhoneNumberStatus, { name: 'PhoneNumberStatus' });

@InputType()
export class PhoneNumberFilterDto {
	@IsString()
	@IsOptional()
	@Field({ nullable: true })
	msisdn?: string;

	@IsEnum(PhoneNumberSource)
	@IsOptional()
	@ApiProperty({ enum: PhoneNumberSource, enumName: 'PhoneNumberSource' })
	@Field(() => PhoneNumberSource, { nullable: true })
	source?: PhoneNumberSource;

	@IsEnum(PhoneNumberStatus)
	@IsOptional()
	@ApiProperty({ enum: PhoneNumberStatus, enumName: 'PhoneNumberStatus' })
	@Field(() => PhoneNumberStatus, { nullable: true })
	status?: PhoneNumberStatus;
}

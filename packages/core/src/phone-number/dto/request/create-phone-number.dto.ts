import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { PhoneNumberSource } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

registerEnumType(PhoneNumberSource, { name: 'PhoneNumberSource' });

@InputType()
export class CreatePhoneNumberDto {
	@IsString()
	@Field()
	msisdn: string;

	@IsEnum(PhoneNumberSource)
	@ApiProperty({ enum: PhoneNumberSource, enumName: 'PhoneNumberSource' })
	@Field(() => PhoneNumberSource)
	source: PhoneNumberSource;
}

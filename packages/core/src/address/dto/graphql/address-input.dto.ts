import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { AddressType } from '@prisma/client';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

registerEnumType(AddressType, { name: 'AddressType' });

@InputType()
export class AddressInputDto {
	@IsString()
	@IsOptional()
	@ValidateIf((_, value) => value !== null)
	@Field(() => String, { nullable: true })
	name?: string | null;

	@Field()
	@IsString()
	line1: string;

	@Field()
	@IsString()
	line2: string;

	@Field()
	@IsString()
	line3: string;

	@Field()
	@IsString()
	line4: string;

	@Field()
	@IsString()
	city: string;

	@Field()
	@IsString()
	postalCode: string;

	@Field()
	@IsString()
	province: string;

	@Field()
	@IsString()
	country: string;
}

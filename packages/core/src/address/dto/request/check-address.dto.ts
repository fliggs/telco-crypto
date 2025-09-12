import { Field, InputType } from '@nestjs/graphql';
import { IsPostalCode, IsString } from 'class-validator';

@InputType()
export class CheckAddressDto {
	@IsString()
	@Field()
	line1: string;

	@IsString()
	@Field()
	line2: string;

	@IsString()
	@Field()
	line3: string;

	@IsString()
	@Field()
	line4: string;

	@IsString()
	@Field()
	city: string;

	@IsPostalCode('any')
	@Field()
	postalCode: string;

	@IsString()
	@Field()
	province: string;

	@IsString()
	@Field()
	country: string;
}

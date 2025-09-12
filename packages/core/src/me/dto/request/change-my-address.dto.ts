import {
	IsOptional,
	IsPostalCode,
	IsString,
	ValidateIf,
} from 'class-validator';

export class ChangeMyAddressDto {
	@IsString()
	@IsOptional()
	@ValidateIf((_, value) => value !== null)
	name?: string | null;

	@IsString()
	line1: string;

	@IsString()
	line2: string;

	@IsString()
	line3: string;

	@IsString()
	line4: string;

	@IsString()
	city: string;

	@IsPostalCode('any')
	postalCode: string;

	@IsString()
	province: string;

	@IsString()
	country: string;
}

import { IsPostalCode, IsString } from 'class-validator';

export class CheckCoverageDto {
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

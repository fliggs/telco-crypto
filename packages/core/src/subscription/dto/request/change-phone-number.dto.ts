import { IsOptional, IsString } from 'class-validator';

export class ChangePhoneNumberDto {
	@IsString()
	@IsOptional()
	msisdn?: string;

	@IsString()
	@IsOptional()
	accountNumber?: string;

	@IsString()
	@IsOptional()
	password?: string;
}

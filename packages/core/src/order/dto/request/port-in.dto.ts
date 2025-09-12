import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PortInDto {
	@IsBoolean()
	@Expose()
	isPortingIn: boolean;

	@IsString()
	@IsOptional()
	@Expose()
	msisdn?: string | undefined;

	@IsString()
	@IsOptional()
	@Expose()
	postalCode?: string | undefined;

	@IsString()
	@IsOptional()
	@Expose()
	accountNumber?: string | undefined;

	@IsString()
	@IsOptional()
	@Expose()
	password?: string | undefined;
}

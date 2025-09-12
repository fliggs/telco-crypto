import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
	@IsString()
	@IsOptional()
	@Expose()
	refreshToken?: string;
}

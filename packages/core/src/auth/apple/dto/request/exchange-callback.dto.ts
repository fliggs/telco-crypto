import { IsOptional, IsString } from 'class-validator';

import { AuthOpenIdExchangeCallbackDto } from '@/auth/open-id/dto/request/exchange-callback.dto';

export class AuthAppleExchangeCallbackDto extends AuthOpenIdExchangeCallbackDto {
	@IsString()
	@IsOptional()
	firstName?: string;

	@IsString()
	@IsOptional()
	lastName?: string;
}

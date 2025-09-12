import { IsJWT } from 'class-validator';

export class AuthOpenIdExchangeCallbackDto {
	@IsJWT()
	idToken: string;
}

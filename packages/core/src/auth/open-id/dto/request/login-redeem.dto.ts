import { IsString } from 'class-validator';

export class AuthOpenIdLoginRedeemDto {
	@IsString()
	code: string;
}

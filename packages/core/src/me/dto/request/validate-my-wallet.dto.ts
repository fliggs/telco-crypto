import { IsBase58, IsString } from 'class-validator';

export class ValidateMyWalletDto {
	@IsString()
	message: string;

	@IsBase58()
	signature: string;
}

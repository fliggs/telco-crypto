import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMyWalletDto {
	@IsBoolean()
	@IsOptional()
	cloudBackup?: boolean;

	@IsBoolean()
	@IsOptional()
	localBackup?: boolean;

	@IsBoolean()
	@IsOptional()
	readOnly?: boolean;
}

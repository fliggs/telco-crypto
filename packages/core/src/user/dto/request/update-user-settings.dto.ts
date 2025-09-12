import { ApiProperty } from '@nestjs/swagger';
import { WalletCashbackCurrency } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
	@IsBoolean()
	@IsOptional()
	email?: boolean;

	@IsBoolean()
	@IsOptional()
	mail?: boolean;

	@IsBoolean()
	@IsOptional()
	sms?: boolean;

	@IsBoolean()
	@IsOptional()
	cpni?: boolean;

	@IsEnum(WalletCashbackCurrency)
	@IsOptional()
	@ApiProperty({
		enum: WalletCashbackCurrency,
		enumName: 'WalletCashbackCurrency',
	})
	cashbackCurrency?: WalletCashbackCurrency;
}

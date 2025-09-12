import { WalletCashbackCurrency } from '@prisma/client';

export interface UserSettingsDto {
	email?: boolean;
	mail?: boolean;
	sms?: boolean;
	cpni?: boolean;
	cashbackCurrency?: WalletCashbackCurrency;
}

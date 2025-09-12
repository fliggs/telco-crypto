import { WalletProvider } from '@prisma/client';

export interface CashbackCryptoDto {
	provider: WalletProvider;
	description: string;
}

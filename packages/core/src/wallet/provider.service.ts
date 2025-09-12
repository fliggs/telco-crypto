import { Injectable } from '@nestjs/common';
import {
	Order,
	User,
	UserSettings,
	Wallet,
	WalletProvider,
} from '@prisma/client';
import { DecimalNumber } from '@/decimal.dto';
import { ConfigService } from '@nestjs/config';

import { DbService } from '@/db/db.service';

import { PriceService } from './price.service';
import { TokenBalanceDto } from './dto/internal/balance.dto';
import { CertificateDto } from './dto/internal/cerificate.dto';
import { TokenHistoryDto } from './dto/internal/token.dto';

@Injectable()
export abstract class WalletProviderService {
	constructor(
		private readonly db: DbService,
		protected readonly config: ConfigService,
		protected readonly priceService: PriceService,
	) {}

	abstract payout(
		user: User & { settings: UserSettings | null },
		wallet: Wallet,
		order: Order,
		amountInUsd: DecimalNumber,
		description: string,
	): Promise<unknown>;

	abstract createCertificate(
		userId: string,
		wallet: Wallet,
		msisdn: string,
	): Promise<CertificateDto>;

	abstract validate(
		userId: string,
		wallet: Wallet,
		message: string,
		signature: string,
	): Promise<boolean>;

	abstract getTokens(
		userId: string,
		wallet: Wallet,
	): Promise<TokenBalanceDto[]>;

	abstract getTokenHistory(
		userId: string,
		wallet: Wallet,
		tokenName: string,
		days: number,
	): Promise<TokenHistoryDto[]>;

	abstract getCertificates(
		userId: string,
		wallet: Wallet,
		phoneNumberMsisdns: string[],
	): Promise<CertificateDto[]>;

	protected async getUserWalletData(provider: WalletProvider, userId: string) {
		return this.db.userWalletData.findUnique({
			where: {
				provider_userId: {
					userId,
					provider,
				},
			},
		});
	}
}

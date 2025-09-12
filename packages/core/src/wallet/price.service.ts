import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
	CoinGeckoHistoryResponse,
	CoinGeckoPriceResponse,
} from './dto/internal/coin-gecko.dto';

const CURRENCY = 'usd';

@Injectable()
export class PriceService {
	private coinGeckoUrl: string;
	private coinGeckoApiKey: string;

	constructor(private readonly config: ConfigService) {}

	async onModuleInit() {
		this.coinGeckoUrl = this.config.getOrThrow('WALLET_COINGECKO_URL');
		this.coinGeckoApiKey = this.config.getOrThrow('WALLET_COINGECKO_API_KEY');
	}

	public async fetchCurrentPrices(
		coinIds: string[],
	): Promise<CoinGeckoPriceResponse> {
		const response = await fetch(
			`${this.coinGeckoUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=${CURRENCY}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-cg-pro-api-key': this.coinGeckoApiKey,
				},
			},
		);
		return response.json();
	}

	public async fetchHistoricPrices(
		coinId: string,
		days: number,
	): Promise<CoinGeckoHistoryResponse> {
		const response = await fetch(
			`${this.coinGeckoUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'x-cg-pro-api-key': this.coinGeckoApiKey,
				},
			},
		);
		return response.json();
	}
}

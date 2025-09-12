export interface CoinGeckoPriceResponse {
	[key: string]: {
		usd: number;
	};
}

export interface CoinGeckoHistoryResponse {
	prices: [number, number][];
	market_caps: [number, number][];
	total_volumes: [number, number][];
}

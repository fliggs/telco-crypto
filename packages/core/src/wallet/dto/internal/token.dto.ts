import { DecimalNumber } from '@/decimal.dto';

export interface TokenDto {
	name: string;
	symbol: string;
	decimals: number;
	image: string;
	exchangeRateUsd: DecimalNumber | null;
}

export interface TokenHistoryDto {
	ts: Date;
	price: number;
}

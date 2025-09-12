import { Expose } from 'class-transformer';

import { Decimal, DecimalNumber } from '@/decimal.dto';

export class PublicTokenBalanceDto {
	@Expose()
	name: string;

	@Expose()
	symbol: string;

	@Expose()
	decimals: number;

	@Expose()
	image: string;

	@Decimal(true)
	exchangeRateUsd: DecimalNumber | null;

	@Decimal()
	balance: DecimalNumber;

	@Decimal(true)
	balanceInUsd: DecimalNumber | null;
}

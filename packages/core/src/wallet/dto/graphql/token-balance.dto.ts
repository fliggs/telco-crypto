import { Expose } from 'class-transformer';
import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Decimal, DecimalNumber } from '@/decimal.dto';

@ObjectType()
export class TokenBalanceDto {
	@Field()
	name: string;

	@Field()
	symbol: string;

	@Field(() => Int)
	decimals: number;

	@Field()
	image: string;

	@Decimal(true)
	exchangeRateUsd: DecimalNumber | null;

	@Decimal()
	balance: DecimalNumber;

	@Decimal(true)
	balanceInUsd: DecimalNumber | null;
}

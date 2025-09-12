import { DecimalNumber } from '@/decimal.dto';

import { TokenDto } from './token.dto';

export interface TokenBalanceDto extends TokenDto {
	balance: DecimalNumber;
	balanceInUsd: DecimalNumber | null;
}

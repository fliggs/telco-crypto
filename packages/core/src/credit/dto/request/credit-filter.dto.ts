import { InputType } from '@nestjs/graphql';
import { IsInstance, IsOptional } from 'class-validator';

import { Decimal, DecimalNumber } from '@/decimal.dto';

@InputType()
export class CreditFilterDto {
	@IsInstance(DecimalNumber)
	@IsOptional()
	@Decimal(true)
	usedCost: DecimalNumber | null;
}

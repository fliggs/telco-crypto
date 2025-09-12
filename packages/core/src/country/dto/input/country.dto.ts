import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsInstance, IsString } from 'class-validator';

import { Decimal, DecimalNumber } from '@/decimal.dto';

@InputType()
export class CountryInputDto {
	@IsString()
	@Field()
	name: string;

	@IsBoolean()
	@Field()
	favourite: boolean;

	@IsBoolean()
	@Field()
	roaming: boolean;

	@Decimal()
	@IsInstance(DecimalNumber)
	rate: DecimalNumber;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsInstance, IsOptional, IsString, IsUUID } from 'class-validator';

import { Decimal, DecimalNumber } from '@/decimal.dto';

@InputType()
export class CreateCreditDto {
	@IsString()
	@Field()
	title: string;

	@IsUUID()
	@Field()
	userId: string;

	@IsUUID()
	@IsOptional()
	@Field(() => String, { nullable: true })
	subscriptionId?: string | null;

	@Decimal()
	@IsInstance(DecimalNumber)
	providedCost: DecimalNumber;
}

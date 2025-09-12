import { DecimalNumber, DecimalScalar } from '@/decimal.dto';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InvoiceItemDto {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field()
	title: string;

	@Field()
	description: string;

	@Field(() => Int)
	amount: number;

	@Field(() => DecimalScalar)
	costPerItem: DecimalNumber;

	@Field(() => DecimalScalar)
	totalCost: DecimalNumber;
}

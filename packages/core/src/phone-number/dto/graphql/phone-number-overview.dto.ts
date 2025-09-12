import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PhoneNumberOverviewDto {
	@Field(() => Int)
	total: number;

	@Field(() => Int)
	initial: number;

	@Field(() => Int)
	available: number;

	@Field(() => Int)
	assigned: number;

	@Field(() => Int)
	reserved: number;
}

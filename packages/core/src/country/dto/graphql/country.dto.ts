import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CountryDto {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field()
	favourite: boolean;

	@Field()
	roaming: boolean;

	@Field(() => Float, { nullable: true })
	rate: number | null;
}

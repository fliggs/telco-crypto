import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SimDetailsDto {
	@Field()
	isActivated: boolean;

	@Field(() => String, { nullable: true })
	eSimStatus: string | null;

	@Field(() => String, { nullable: true })
	eSimActivationCode: string | null;
}

import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserBillingDataDto {
	@Field()
	id: string;

	@Field()
	provider: string;
}

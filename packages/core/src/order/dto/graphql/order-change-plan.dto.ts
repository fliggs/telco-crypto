import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrderChangePlanDetailsDto {
	@Field()
	orderId: string;

	@Field()
	offerId: string;
}

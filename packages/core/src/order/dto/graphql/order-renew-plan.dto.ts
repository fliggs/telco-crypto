import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OrderRenewPlanDetailsDto {
	@Field()
	orderId: string;

	@Field()
	offerId: string;

	@Field(() => String, { nullable: true })
	subscriptionPeriodId: string | null;
}

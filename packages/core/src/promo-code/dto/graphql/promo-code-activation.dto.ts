import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PromoCodeActivationDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	orderId: string;

	@Field(() => String, { nullable: true })
	subscriptionId: string | null;
}

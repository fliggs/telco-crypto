import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SimType } from '@prisma/client';

registerEnumType(SimType, { name: 'SimType' });

@ObjectType()
export class OrderAddPlanDetailsDto {
	@Field()
	orderId: string;

	@Field()
	offerId: string;

	@Field(() => String, { nullable: true })
	subscriptionPeriodId: string | null;

	@Field(() => SimType)
	simType?: SimType;

	@Field(() => String, { nullable: true })
	simIccid?: string | null;

	@Field()
	portIn: boolean;

	@Field(() => String, { nullable: true })
	portInMsisdn?: string | null;

	@Field(() => String, { nullable: true })
	portInAccountNumber?: string | null;

	@Field(() => String, { nullable: true })
	portInPassword?: string | null;

	@Field(() => String, { nullable: true })
	portInPostalCode?: string | null;
}

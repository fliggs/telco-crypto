import { SubscriptionStatus } from '@prisma/client';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '@/paginated';

registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });

@ObjectType()
export class SubscriptionDto {
	@Field()
	id: string;

	@Field(() => SubscriptionStatus)
	status: SubscriptionStatus;

	@Field(() => String, { nullable: true })
	label: string | null;

	@Field(() => String, { nullable: true })
	phoneNumberMsisdn: string | null;

	@Field(() => String, { nullable: true })
	simIccid: string | null;

	@Field(() => String)
	userId: string;

	@Field(() => String, { nullable: true })
	offerId: string | null;

	@Field(() => String, { nullable: true })
	parentId: string | null;

	@Field(() => String, { nullable: true })
	currentPeriodId: string | null;
}

@ObjectType()
export class PaginatedSubscriptions extends Paginated(SubscriptionDto) {}

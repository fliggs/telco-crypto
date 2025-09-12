import { Paginated } from '@/paginated';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SubscriptionPeriodStatus } from '@prisma/client';

registerEnumType(SubscriptionPeriodStatus, {
	name: 'SubscriptionPeriodStatus',
});

@ObjectType()
export class SubscriptionPeriodDto {
	@Field()
	id: string;

	@Field(() => SubscriptionPeriodStatus)
	status: SubscriptionPeriodStatus;

	@Field()
	createdAt: Date;

	@Field()
	startsAt: Date;

	@Field()
	endsAt: Date;

	@Field()
	offerId: string;
}

@ObjectType()
export class PaginatedSubscriptionPeriods extends Paginated(
	SubscriptionPeriodDto,
) {}

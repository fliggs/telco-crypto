import { Field, ObjectType } from '@nestjs/graphql';

import { SubscriptionUsageDto } from './subscription-usage.dto';

@ObjectType()
export class SubscriptionHistoryDto {
	@Field()
	id: string;

	@Field()
	subscriptionId: string;

	@Field(() => Date)
	timestamp: Date;

	@Field(() => String, { nullable: true })
	simIccid: string | null;

	@Field(() => String, { nullable: true })
	phoneNumberMsisdn: string | null;

	@Field(() => [SubscriptionUsageDto])
	usage: SubscriptionUsageDto[];
}

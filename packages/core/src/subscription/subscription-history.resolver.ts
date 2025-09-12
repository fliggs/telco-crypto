import { Args, Query, Resolver } from '@nestjs/graphql';
import { BadRequestException, NotImplementedException } from '@nestjs/common';

import { AdminAccess } from '@/auth/access.decorator';

import { SubscriptionHistoryDto } from './dto/graphql/subscription-history.dto';
import { SubscriptionHistoryService } from './subscription-history.service';

@Resolver(() => SubscriptionHistoryDto)
export class SubscriptionHistoryResolver {
	constructor(private readonly subHistoryService: SubscriptionHistoryService) {}

	@AdminAccess()
	@Query(() => [SubscriptionHistoryDto])
	async subscriptionHistory(
		@Args('id', { type: () => String, nullable: true }) id: string | null,
		@Args('simIccid', { type: () => String, nullable: true })
		simIccid: string | null,
		@Args('phoneNumberMsisdn', { type: () => String, nullable: true })
		phoneNumberMsisdn: string | null,
	): Promise<SubscriptionHistoryDto[]> {
		if (id) {
			return this.subHistoryService.findBySubscription(id);
		} else if (simIccid) {
			return this.subHistoryService.findBySim(simIccid);
		} else if (phoneNumberMsisdn) {
			throw new NotImplementedException('not_implemented');
		} else {
			throw new BadRequestException('at_least_one_identifier_required');
		}
	}
}

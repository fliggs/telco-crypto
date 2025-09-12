import { Field, ObjectType } from '@nestjs/graphql';

import { Paginated } from '@/paginated';
import { Decimal, DecimalNumber } from '@/decimal.dto';

@ObjectType()
export class RewardPayoutDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field()
	rewardId: string;

	@Field()
	userId: string;

	@Field()
	offerId: string;

	@Decimal()
	cost: DecimalNumber;
}

@ObjectType()
export class PaginatedRewardPayouts extends Paginated(RewardPayoutDto) {}

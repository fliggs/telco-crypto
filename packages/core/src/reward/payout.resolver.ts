import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Reward } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { RewardPayoutDto } from './dto/graphql/payout.dto';

@Resolver(RewardPayoutDto)
export class RewardPayoutResolver {
	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() reward: Reward): Promise<string> {
		return JSON.stringify(reward.data);
	}
}

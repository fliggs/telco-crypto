import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserBillingData } from '@prisma/client';

import { UserBillingDataDto } from './dto/graphql/user-billing-data.dto';

@Resolver(() => UserBillingDataDto)
export class UserBillingDataResolver {
	@ResolveField(() => String)
	async data(@Parent() ubd: UserBillingData): Promise<string> {
		return JSON.stringify(ubd.data);
	}
}

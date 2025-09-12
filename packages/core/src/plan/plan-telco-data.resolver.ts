import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PlanTelcoData } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { PlanTelcoDataDto } from './dto/graphql/plan-telco-data.dto';

@Resolver(() => PlanTelcoDataDto)
export class PlanTelcoDataResolver {
	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() planTelcoData: PlanTelcoData): Promise<string> {
		return JSON.stringify(planTelcoData.data);
	}
}

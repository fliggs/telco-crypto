import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { PlanTaxData } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { PlanTaxDataDto } from './dto/graphql/plan-tax-data.dto';

@Resolver(() => PlanTaxDataDto)
export class PlanTaxDataResolver {
	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() planTaxData: PlanTaxData): Promise<string> {
		return JSON.stringify(planTaxData.data);
	}
}

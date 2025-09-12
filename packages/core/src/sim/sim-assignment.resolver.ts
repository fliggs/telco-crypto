import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { SimAssignment } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { SimLoader } from './sim.loader';
import { SimAssignmentDto } from './dto/graphql/sim-assignment.dto';
import { SimDto } from './dto/graphql/sim.dto';

@Resolver(() => SimAssignmentDto)
export class SimAssignmentResolver {
	constructor(private readonly simLoader: SimLoader) {}

	@AdminAccess()
	@ResolveField(() => SimDto)
	async sim(@Parent() sa: SimAssignment) {
		return this.simLoader.byIccid.load(sa.simIccid);
	}
}

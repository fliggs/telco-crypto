import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';

import { OnboardingStageDto } from './dto/graphql/onboarding-stage.dto';
import { OnboardingService } from './onboarding.service';
import { OnboardingProgressDto } from './dto/graphql/onboarding-progress.dto';
import { OnboardingStage } from '@prisma/client';

@Resolver(() => OnboardingStageDto)
export class OnboardingResolver {
	constructor(private readonly onboardingSrv: OnboardingService) {}

	@AdminAccess()
	@Query(() => [OnboardingStageDto])
	async onboardingStages(): Promise<OnboardingStageDto[]> {
		return this.onboardingSrv.findAllStages();
	}

	@AdminAccess()
	@Query(() => OnboardingStageDto)
	async onboardingStage(
		@Args('name') name: string,
	): Promise<OnboardingStageDto> {
		return this.onboardingSrv.findOne(name);
	}

	@AdminAccess()
	@Mutation(() => OnboardingProgressDto)
	async changeUserOnboardingProgress(
		@Args('userId', { type: () => String })
		userId: string,
		@Args('stageName', { type: () => String })
		stageName: string,
		@Args('startedAt', { type: () => Date, nullable: true })
		startedAt: Date | null,
		@Args('completedAt', { type: () => Date, nullable: true })
		completedAt: Date | null,
	): Promise<OnboardingProgressDto> {
		return this.onboardingSrv.setProgress(
			userId,
			stageName,
			startedAt,
			completedAt,
		);
	}

	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() parent: OnboardingStage) {
		return JSON.stringify(parent.data);
	}
}

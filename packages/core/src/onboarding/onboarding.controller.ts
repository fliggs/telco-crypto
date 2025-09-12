import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { PublicAccess } from '@/auth/access.decorator';

import { OnboardingService } from './onboarding.service';
import { PublicOnboardingStageDto } from './dto/response/public-onboarding-stage.dto';

@Controller({
	path: 'onboarding',
	version: '1',
})
export class OnboardingController {
	constructor(private readonly onboardingService: OnboardingService) {}

	@Get('public')
	@PublicAccess()
	@SerializeOptions({ type: PublicOnboardingStageDto })
	async findAllPublicStages(): Promise<PublicOnboardingStageDto[]> {
		return this.onboardingService.findAllPublicStages();
	}
}

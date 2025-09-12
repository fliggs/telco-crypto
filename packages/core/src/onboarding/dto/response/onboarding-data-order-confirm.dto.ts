import { Expose } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { OnboardingStageType } from '@prisma/client';

import { OnboardingDataDto } from './onboarding-data.dto';

export class OnboardingDataOrderConfirmDto extends OnboardingDataDto {
	@Expose()
	@ApiHideProperty()
	type: typeof OnboardingStageType.ORDER_CONFIRM;

	@Expose()
	payment?: boolean;

	@Expose()
	stages: string[];
}

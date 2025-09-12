import { Expose } from 'class-transformer';

import { OnboardingDataAddressDto } from './onboarding-data-address.dto';
import { OnboardingDataOrderConfirmDto } from './onboarding-data-order-confirm.dto';

export class OnboardingDataDto {
	@Expose()
	type: string;

	@Expose()
	showInProgress?: boolean;
}

export type AnyOnboardingData =
	| OnboardingDataAddressDto
	| OnboardingDataOrderConfirmDto
	| OnboardingDataDto
	| null;

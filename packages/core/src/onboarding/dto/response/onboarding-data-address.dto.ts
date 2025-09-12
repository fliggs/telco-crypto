import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { AddressType, OnboardingStageType } from '@prisma/client';
import { Expose } from 'class-transformer';

import { OnboardingDataDto } from './onboarding-data.dto';

export class OnboardingDataAddressDto extends OnboardingDataDto {
	@Expose()
	@ApiHideProperty()
	type: typeof OnboardingStageType.ADDRESS;

	@Expose()
	@ApiProperty({ enum: AddressType, enumName: 'AddressType' })
	addressType: AddressType;
}

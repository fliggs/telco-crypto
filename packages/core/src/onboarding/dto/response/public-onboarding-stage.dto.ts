import { ApiProperty } from '@nestjs/swagger';
import { OnboardingStageType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { Mapped } from '@/mapped';
import { Content } from '@/content/dto/internal/content.dto';
import { PublicContentDto } from '@/content/dto/response/public-content.dto';

import { AnyOnboardingData, OnboardingDataDto } from './onboarding-data.dto';
import { OnboardingDataAddressDto } from './onboarding-data-address.dto';
import { OnboardingDataOrderConfirmDto } from './onboarding-data-order-confirm.dto';

export class PublicOnboardingStageDto {
	@Expose()
	name: string;

	@Expose()
	sort: number;

	@Expose()
	@ApiProperty({ enum: OnboardingStageType, enumName: 'OnboardingStageType' })
	type: OnboardingStageType;

	@Expose()
	required: boolean;

	@Expose()
	@Type(() => PublicContentDto)
	@ApiProperty({ type: PublicContentDto })
	content: Content;

	@Mapped(OnboardingDataDto, {
		[OnboardingStageType.ADDRESS]: OnboardingDataAddressDto,
		[OnboardingStageType.CONTENT]: OnboardingDataDto,
		[OnboardingStageType.KYC]: OnboardingDataDto,
		[OnboardingStageType.ORDER_CONFIRM]: OnboardingDataOrderConfirmDto,
		[OnboardingStageType.ORDER_MSISDN]: OnboardingDataDto,
		[OnboardingStageType.ORDER_PLAN]: OnboardingDataDto,
		[OnboardingStageType.ORDER_PROCESS]: OnboardingDataDto,
		[OnboardingStageType.ORDER_SIM_TYPE]: OnboardingDataDto,
		[OnboardingStageType.PAYMENT]: OnboardingDataDto,
	})
	data: AnyOnboardingData;
}

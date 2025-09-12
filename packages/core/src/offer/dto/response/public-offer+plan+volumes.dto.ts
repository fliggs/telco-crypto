import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Decimal, DecimalNumber } from '@/decimal.dto';
import { PublicPlanWithVolumesDto } from '@/plan/dto/response/public-plan+volumes.dto';
import { PublicContentDto } from '@/content/dto/response/public-content.dto';
import { Content } from '@/content/dto/internal/content.dto';

export class PublicOfferWithPlanWithVolumesDto {
	@Expose()
	id: string;

	@Expose()
	legalId: string;

	@Expose()
	sort: number;

	@Expose()
	validFrom: Date | null;

	@Expose()
	validUntil: Date | null;

	@Decimal()
	cost: DecimalNumber;

	@Decimal(true)
	originalCost: DecimalNumber | null;

	@Decimal()
	providedCredits: DecimalNumber | null;

	@Expose()
	@Type(() => PublicContentDto)
	@ApiProperty({ type: PublicContentDto })
	content: Content;

	@Expose()
	planId: string;

	@Expose()
	@Type(() => PublicPlanWithVolumesDto)
	plan: PublicPlanWithVolumesDto;
}

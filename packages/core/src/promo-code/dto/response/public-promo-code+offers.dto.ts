import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Content } from '@/content/dto/internal/content.dto';
import { PublicContentDto } from '@/content/dto/response/public-content.dto';
import { PublicOfferWithPlanWithVolumesDto } from '@/offer/dto/response/public-offer+plan+volumes.dto';

export class PublicPromoCodeWithOffersDto {
	@Expose()
	id: string;

	@Expose()
	code: string;

	@Expose()
	@Type(() => PublicContentDto)
	@ApiProperty({ type: PublicContentDto })
	content: Content;

	@Expose()
	@Type(() => PublicOfferWithPlanWithVolumesDto)
	offers: PublicOfferWithPlanWithVolumesDto[];
}

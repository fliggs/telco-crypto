import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { PublicContentDto } from '@/content/dto/response/public-content.dto';
import { Content } from '@/content/dto/internal/content.dto';

export class PublicPlanDto {
	@Expose()
	id: string;

	@Expose()
	name: string;

	@Expose()
	isStandalone: boolean;

	@Expose()
	validForSeconds: number;

	@Expose()
	doesAutoRenew: boolean;

	@Expose()
	@Type(() => PublicContentDto)
	@ApiProperty({ type: PublicContentDto })
	content: Content;
}

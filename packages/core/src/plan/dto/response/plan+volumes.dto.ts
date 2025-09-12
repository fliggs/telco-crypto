import { Expose, Type } from 'class-transformer';

import { PublicContentDto } from '@/content/dto/response/public-content.dto';
import { VolumeDto } from '@/volume/dto/response/volume.dto';
import { Content } from '@/content/dto/internal/content.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PlanWithVolumesDto {
	@Expose()
	id: string;

	@Expose()
	name: string;

	@Expose()
	version: number;

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

	@Expose()
	@Type(() => VolumeDto)
	volumes: VolumeDto[];
}

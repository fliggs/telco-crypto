import { Type } from 'class-transformer';
import { IsBoolean, IsInstance, IsInt, ValidateNested } from 'class-validator';

import { CreateVolumeDto } from '@/volume/dto/request/create-volume.dto';
import { PublicContentDto } from '@/content/dto/response/public-content.dto';

export class CreatePlanVersionDto {
	@IsBoolean()
	isStandalone: boolean;

	@IsInt()
	validForSeconds: number;

	@IsBoolean()
	doesAutoRenew: boolean;

	@ValidateNested()
	@Type(() => CreateVolumeDto)
	@IsInstance(CreateVolumeDto, { each: true })
	volumes: CreateVolumeDto[];

	@ValidateNested()
	@Type(() => PublicContentDto)
	@IsInstance(PublicContentDto)
	content: PublicContentDto;
}

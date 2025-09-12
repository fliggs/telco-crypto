import { Type } from 'class-transformer';
import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsInstance, IsInt, ValidateNested } from 'class-validator';

import { CreateVolumeDto } from '@/volume/dto/request/create-volume.dto';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';

@InputType()
export class CreatePlanDto {
	@IsBoolean()
	@Field()
	isStandalone: boolean;

	@IsInt()
	@Field()
	validForSeconds: number;

	@IsBoolean()
	@Field()
	doesAutoRenew: boolean;

	@ValidateNested()
	@IsInstance(CreateVolumeDto, { each: true })
	@Field(() => [CreateVolumeDto])
	@Type(() => CreateVolumeDto)
	volumes: CreateVolumeDto[];

	@ValidateNested()
	@IsInstance(ContentInputDto)
	@Field(() => ContentInputDto)
	@Type(() => ContentInputDto)
	content: ContentInputDto;
}

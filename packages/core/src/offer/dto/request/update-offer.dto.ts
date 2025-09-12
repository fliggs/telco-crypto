import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsInstance,
	IsNumber,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

import { ContentInputDto } from '@/content/dto/request/content-input.dto';

export class UpdateOfferDto {
	@IsOptional()
	@IsString()
	legalId?: string;

	@IsNumber()
	@IsOptional()
	sort?: number;

	@IsBoolean()
	@IsOptional()
	isActive?: boolean;

	@IsBoolean()
	@IsOptional()
	isPublic?: boolean;

	@ValidateNested()
	@IsInstance(ContentInputDto)
	@IsOptional()
	@Type(() => ContentInputDto)
	content?: ContentInputDto;
}

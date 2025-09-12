import { Field, InputType } from '@nestjs/graphql';
import {
	IsInstance,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

import { ContentBlockInputDto } from './content-block-input.dto';
import { Type } from 'class-transformer';

@InputType()
export class ContentInputDto {
	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	title?: string | null;

	@ValidateNested()
	@IsInstance(ContentBlockInputDto)
	@IsOptional()
	@Type(() => ContentBlockInputDto)
	@Field(() => ContentBlockInputDto, { nullable: true })
	summary?: ContentBlockInputDto | null;

	@ValidateNested()
	@IsInstance(ContentBlockInputDto, { each: true })
	@IsOptional()
	@Type(() => ContentBlockInputDto)
	@Field(() => [ContentBlockInputDto], { nullable: true })
	details?: (ContentBlockInputDto | null)[] | null;

	@IsString({ each: true })
	@IsOptional()
	@Field(() => [String], { nullable: true })
	tags?: string[] | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	bgImage?: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	color?: string | null;
}

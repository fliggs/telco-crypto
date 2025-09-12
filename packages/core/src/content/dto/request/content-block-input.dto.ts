import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { ContentBlockType } from '../../content-block.type';

@InputType()
export class ContentBlockInputDto {
	@IsEnum(ContentBlockType)
	@Field(() => ContentBlockType)
	type: ContentBlockType;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	title: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	text: string | null;

	@IsString({ each: true })
	@IsOptional()
	@Field(() => [String], { nullable: true })
	items: string[] | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	image: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	variant: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	color: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	spacing: string | null;
}

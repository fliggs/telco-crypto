import { Field, ObjectType } from '@nestjs/graphql';

import { ContentBlock } from './content-block.dto';

@ObjectType()
export class ContentDto {
	@Field(() => String, { nullable: true })
	title?: string | null;

	@Field(() => ContentBlock, { nullable: true })
	summary?: typeof ContentBlock | null;

	@Field(() => [ContentBlock], { nullable: true })
	details?: (typeof ContentBlock | null)[] | null;

	@Field(() => [String], { nullable: true })
	tags?: string[] | null;

	@Field(() => String, { nullable: true })
	bgImage?: string | null;

	@Field(() => String, { nullable: true })
	color?: string | null;
}

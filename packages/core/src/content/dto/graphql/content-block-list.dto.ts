import { Field, ObjectType } from '@nestjs/graphql';

import { ContentBaseBlockDto } from './content-block-base.dto';

@ObjectType({ implements: [ContentBaseBlockDto] })
export class ContentBlockListDto extends ContentBaseBlockDto {
	@Field(() => [String])
	items: string[];

	@Field(() => String, { nullable: true })
	title?: string | null;

	@Field(() => String, { nullable: true })
	variant?: string | null;

	@Field(() => String, { nullable: true })
	color?: string | null;
}

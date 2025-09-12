import { Field, ObjectType } from '@nestjs/graphql';

import { ContentBaseBlockDto } from './content-block-base.dto';

@ObjectType({ implements: [ContentBaseBlockDto] })
export class ContentBlockTextDto extends ContentBaseBlockDto {
	@Field()
	text: string;

	@Field(() => String, { nullable: true })
	title?: string | null;

	@Field(() => String, { nullable: true })
	variant?: string | null;

	@Field(() => String, { nullable: true })
	color?: string | null;
}

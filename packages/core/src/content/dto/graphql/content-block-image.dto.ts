import { Field, ObjectType } from '@nestjs/graphql';

import { ContentBaseBlockDto } from './content-block-base.dto';

@ObjectType({ implements: [ContentBaseBlockDto] })
export class ContentBlockImageDto extends ContentBaseBlockDto {
	@Field(() => String)
	image: string;

	@Field(() => String, { nullable: true })
	title?: string | null;
}

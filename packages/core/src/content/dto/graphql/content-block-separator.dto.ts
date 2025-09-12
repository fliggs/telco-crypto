import { Field, ObjectType } from '@nestjs/graphql';

import { ContentBaseBlockDto } from './content-block-base.dto';

@ObjectType({ implements: [ContentBaseBlockDto] })
export class ContentBlockSeparatorDto extends ContentBaseBlockDto {
	@Field(() => String, { nullable: true })
	color?: string | null;
}

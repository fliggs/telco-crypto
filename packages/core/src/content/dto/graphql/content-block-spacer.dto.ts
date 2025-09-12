import { Field, ObjectType } from '@nestjs/graphql';

import { ContentBaseBlockDto } from './content-block-base.dto';

@ObjectType({ implements: [ContentBaseBlockDto] })
export class ContentBlockSpacerDto extends ContentBaseBlockDto {
	@Field(() => String, { nullable: true })
	spacing?: string | null;
}

import { Field, InterfaceType } from '@nestjs/graphql';

import { ContentBlockType } from '../../content-block.type';

@InterfaceType()
export class ContentBaseBlockDto {
	@Field(() => ContentBlockType)
	type: ContentBlockType;
}

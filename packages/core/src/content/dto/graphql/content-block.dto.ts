import { createUnionType } from '@nestjs/graphql';

import { ContentBlockType } from '../../content-block.type';
import { ContentBlockListDto } from './content-block-list.dto';
import { ContentBlockTextDto } from './content-block-text.dto';
import { ContentBlockImageDto } from './content-block-image.dto';
import { ContentBlockSeparatorDto } from './content-block-separator.dto';
import { ContentBlockSpacerDto } from './content-block-spacer.dto';

export const ContentBlock = createUnionType({
	name: 'ContentBlock',
	types: () =>
		[
			ContentBlockTextDto,
			ContentBlockListDto,
			ContentBlockImageDto,
			ContentBlockSpacerDto,
			ContentBlockSeparatorDto,
		] as const,
	resolveType(value) {
		switch (value?.type) {
			case ContentBlockType.TEXT:
				return ContentBlockTextDto;

			case ContentBlockType.LIST:
				return ContentBlockListDto;

			case ContentBlockType.IMAGE:
				return ContentBlockImageDto;

			case ContentBlockType.SPACER:
				return ContentBlockSpacerDto;

			case ContentBlockType.SEPARATOR:
				return ContentBlockSeparatorDto;

			default:
				return null;
		}
	},
});

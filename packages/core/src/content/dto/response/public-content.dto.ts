import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Mapped } from '@/mapped';

import { AnyContentBlock, ContentBlockDto } from './content-block.dto';
import { ContentBlockListDto } from './content-block-list.dto';
import { ContentBlockTextDto } from './content-block-text.dto';
import { ContentBlockImageDto } from './content-block-image.dto';
import { ContentBlockSeparatorDto } from './content-block-separator.dto';
import { ContentBlockSpacerDto } from './content-block-spacer.dto';

export class PublicContentDto {
	@Expose()
	title?: string | null;

	@Mapped(ContentBlockDto, {
		text: ContentBlockTextDto,
		list: ContentBlockListDto,
		image: ContentBlockImageDto,
		spacer: ContentBlockSpacerDto,
		separator: ContentBlockSeparatorDto,
	})
	summary?: AnyContentBlock | null;

	@Mapped([ContentBlockDto], {
		text: ContentBlockTextDto,
		list: ContentBlockListDto,
		image: ContentBlockImageDto,
		spacer: ContentBlockSpacerDto,
		separator: ContentBlockSeparatorDto,
	})
	details?: AnyContentBlock[] | null;

	@Expose()
	@ApiProperty({
		type: 'string',
		isArray: true,
		nullable: true,
		required: false,
	})
	tags?: string[] | null;

	@Expose()
	bgImage?: string;

	@Expose()
	color?: string;
}

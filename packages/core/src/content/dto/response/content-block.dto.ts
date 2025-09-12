import { Expose } from 'class-transformer';

import { ContentBlockListDto } from './content-block-list.dto';
import { ContentBlockTextDto } from './content-block-text.dto';
import { ContentBlockImageDto } from './content-block-image.dto';
import { ContentBlockSeparatorDto } from './content-block-separator.dto';
import { ContentBlockSpacerDto } from './content-block-spacer.dto';

export class ContentBlockDto {
	@Expose()
	type: string;
}

export type AnyContentBlock =
	| ContentBlockListDto
	| ContentBlockTextDto
	| ContentBlockImageDto
	| ContentBlockSeparatorDto
	| ContentBlockSpacerDto
	| null;

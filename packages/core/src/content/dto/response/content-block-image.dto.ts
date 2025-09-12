import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { ContentBlockType } from '../../content-block.type';

import { ContentBlockDto } from './content-block.dto';

export class ContentBlockImageDto extends ContentBlockDto {
	@ApiHideProperty()
	@Expose()
	type: ContentBlockType;

	@Expose()
	image: string;

	@Expose()
	title?: string;

	@Expose()
	@ApiProperty({ name: 'content', type: 'string' })
	get content(): string {
		return '';
	}
}

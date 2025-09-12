import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { ContentBlockType } from '../../content-block.type';

import { ContentBlockDto } from './content-block.dto';

export class ContentBlockListDto extends ContentBlockDto {
	@ApiHideProperty()
	@Expose()
	type: ContentBlockType;

	@Expose()
	items: string[];

	@Expose()
	title?: string;

	@Expose()
	variant?: string;

	@Expose()
	color?: string;

	@Expose()
	@ApiProperty({ name: 'content', type: 'string', isArray: true })
	get content(): string[] {
		return this.items;
	}
}

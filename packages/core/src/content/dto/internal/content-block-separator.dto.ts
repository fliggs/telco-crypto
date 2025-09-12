import { ContentBlockType } from '@/content/content-block.type';

export interface ContentBlockSeparator {
	type: ContentBlockType.SEPARATOR;
	color?: string;
}

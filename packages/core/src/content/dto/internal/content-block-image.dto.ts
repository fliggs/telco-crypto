import { ContentBlockType } from '@/content/content-block.type';

export interface ContentBlockImage {
	type: ContentBlockType.IMAGE;
	image: string;
	title?: string;
}

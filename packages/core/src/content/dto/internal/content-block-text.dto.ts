import { ContentBlockType } from '@/content/content-block.type';

export interface ContentBlockText {
	type: ContentBlockType.TEXT;
	text: string;
	title?: string;
	variant?: string;
	color?: string;
}

import { ContentBlockType } from '@/content/content-block.type';

export interface ContentBlockList {
	type: ContentBlockType.LIST;
	items: string[];
	title?: string;
	variant?: string;
	color?: string;
}

import { ContentBlockType } from '@/content/content-block.type';

export interface ContentBlockSpacer {
	type: ContentBlockType.SPACER;
	spacing: string;
}

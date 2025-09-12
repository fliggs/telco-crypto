import { ContentBlock } from './content-block.dto';

export class Content {
	title?: string | null;
	summary?: ContentBlock | null;
	details?: (ContentBlock | null)[] | null;
	tags?: string[] | null;
	bgImage?: string | null;
	color?: string | null;
}

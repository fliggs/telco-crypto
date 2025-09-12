import { ContentBlockImage } from './content-block-image.dto';
import { ContentBlockList } from './content-block-list.dto';
import { ContentBlockSeparator } from './content-block-separator.dto';
import { ContentBlockSpacer } from './content-block-spacer.dto';
import { ContentBlockText } from './content-block-text.dto';

export type ContentBlock =
	| ContentBlockList
	| ContentBlockText
	| ContentBlockImage
	| ContentBlockSpacer
	| ContentBlockSeparator
	| null;

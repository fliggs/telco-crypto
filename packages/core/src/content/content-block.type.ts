import { registerEnumType } from '@nestjs/graphql';

export enum ContentBlockType {
	TEXT = 'text',
	LIST = 'list',
	IMAGE = 'image',
	SPACER = 'spacer',
	SEPARATOR = 'separator',
}

registerEnumType(ContentBlockType, { name: 'ContentBlockType' });

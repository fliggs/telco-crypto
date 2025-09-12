import { ApiProperty } from '@nestjs/swagger';
import { ClassConstructor, Expose, Transform, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

import { DEFAULT_TAKE, MAX_TAKE } from './defaults';

@InputType()
export class PaginationArgs {
	@IsString()
	@IsOptional()
	@Transform(
		({ obj, key }) =>
			obj[key] ? Buffer.from(obj[key], 'base64url').toString() : null,
		{ toClassOnly: true },
	)
	@ApiProperty({ type: 'string', required: false })
	@Field(() => String, { nullable: true })
	before?: string | null;

	@IsNumber()
	@IsOptional()
	@Min(1)
	@Type(() => Number)
	@ApiProperty({ type: 'integer', required: false })
	@Field(() => Int, { nullable: true })
	last?: number | null;

	@IsString()
	@IsOptional()
	@Transform(
		({ obj, key }) =>
			obj[key] ? Buffer.from(obj[key], 'base64url').toString() : null,
		{ toClassOnly: true },
	)
	@ApiProperty({ type: 'string', required: false })
	@Field(() => String, { nullable: true })
	after?: string | null;

	@IsNumber()
	@IsOptional()
	@Min(1)
	@Type(() => Number)
	@ApiProperty({ type: 'integer', required: false })
	@Field(() => Int, { nullable: true })
	first?: number | null;
}

export type PaginatedLoad<KEY, FILTER> = [
	KEY,
	FILTER | undefined,
	number,
	number,
	string | null,
];

export interface Paginated<T> {
	items: T[];
	startCursor: string | null;
	hasPreviousPage: boolean;
	endCursor: string | null;
	hasNextPage: boolean;
}

export function Paginated<T extends ClassConstructor<any>>(
	clazz: T,
): ClassConstructor<Paginated<InstanceType<T>>> {
	@ObjectType()
	class PaginatedClass<T> {
		@Expose()
		@Type(() => clazz)
		@ApiProperty({ type: clazz, isArray: true })
		@Field(() => [clazz])
		items: T[];

		@Expose()
		@ApiProperty({ type: 'string', nullable: true })
		@Field(() => String, { nullable: true })
		startCursor: string | null;

		@Expose()
		@ApiProperty({ type: 'boolean' })
		@Field()
		hasPreviousPage: boolean;

		@Expose()
		@ApiProperty({ type: 'string', nullable: true })
		@Field(() => String, { nullable: true })
		endCursor: string | null;

		@Expose()
		@ApiProperty({ type: 'boolean' })
		@Field()
		hasNextPage: boolean;
	}

	Object.defineProperty(PaginatedClass, 'name', {
		value: `Paginated${clazz.name}`,
	});

	return PaginatedClass;
}

function getPageSize(take?: number | null) {
	return Math.max(Math.min(MAX_TAKE, take ?? DEFAULT_TAKE), 1);
}

export async function paginate<T>(
	getItems: (take: number, skip: number, cursor: string | null) => Promise<T[]>,
	getCursor: (item: T) => string,
	args?: PaginationArgs,
): Promise<Paginated<T>> {
	const before = args?.before;
	const last = getPageSize(args?.last);
	const after = args?.after;
	const first = getPageSize(args?.first);

	const allItems = await getItems(
		before ? -last - 1 : first + 1,
		before || after ? 1 : 0,
		before ?? after ?? null,
	);

	const items = before ? allItems.slice(-last) : allItems.slice(0, first);

	return {
		items,
		startCursor:
			items.length > 0
				? Buffer.from(getCursor(items[0])).toString('base64url')
				: null,
		hasPreviousPage: !!before && allItems.length > items.length,
		endCursor:
			items.length > 0
				? Buffer.from(getCursor(items[items.length - 1])).toString('base64url')
				: null,
		hasNextPage: !before && allItems.length > items.length,
	};
}

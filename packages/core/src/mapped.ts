import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ClassConstructor, Expose, Transform, Type } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';
import { SchemaObjectMetadata } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface';
import { Field, ObjectType, ReturnTypeFunc } from '@nestjs/graphql';

export const EXTRA_MAPPED_MODELS: Set<ClassConstructor<unknown>> = new Set();

export function Mapped(
	baseType: ClassConstructor<unknown> | [ClassConstructor<unknown>],
	map: Record<string, ClassConstructor<unknown>>,
) {
	const isArray = Array.isArray(baseType);
	const type = isArray ? baseType[0] : baseType;
	const obj = {
		nullable: true,
		oneOf: Object.values(map).map((value) => ({
			$ref: getSchemaPath(value),
		})),
		discriminator: {
			propertyName: 'type',
			mapping: Object.entries(map).reduce(
				(acc, [key, value]) => ({
					...acc,
					[key]: getSchemaPath(value),
				}),
				{} as Record<string, string>,
			),
		},
	} as const;

	EXTRA_MAPPED_MODELS.add(type);
	for (const value of Object.values(map)) {
		EXTRA_MAPPED_MODELS.add(value);
	}

	return applyDecorators(
		Expose(),
		Type(() => type, {
			discriminator: {
				property: 'type',
				subTypes: Object.entries(map).map(([key, value]) => ({
					name: key,
					value,
				})),
			},
			keepDiscriminatorProperty: true,
		}),
		ApiProperty(isArray ? { type: 'array', items: obj, nullable: true } : obj),
	);
}

export function EnumMap(
	enumeration: Record<string, any>,
	data: SchemaObjectMetadata,
	gql?: { name: string; type: ReturnTypeFunc; nullable?: boolean },
) {
	const props = Object.values(enumeration).reduce(
		(obj, curr) => ({ ...obj, [curr]: { ...data } }),
		{},
	);

	@ObjectType()
	class MapClass {}

	if (gql) {
		Object.defineProperty(MapClass, 'name', { value: `${gql.name}Map` });
		for (const value of Object.values(enumeration)) {
			Field(gql.type, { nullable: gql.nullable })(MapClass.prototype, value);
		}
	}

	return applyDecorators(
		Expose(),
		Type(() => Map<typeof enumeration, Number>),
		Transform((params) => params.obj[params.key], { toClassOnly: true }),
		ApiProperty({ type: 'object', properties: props }),
		Field(() => MapClass, { nullable: gql?.nullable }),
	);
}

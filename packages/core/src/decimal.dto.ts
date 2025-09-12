import { applyDecorators } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Expose, Transform, Type } from 'class-transformer';
import { GraphQLScalarType } from 'graphql';

export class DecimalNumber extends Prisma.Decimal {
	constructor(value: Prisma.Decimal.Value | bigint = 0) {
		super(typeof value === 'bigint' ? value.toString() : value);
	}
}

export function Decimal(nullable?: boolean) {
	return applyDecorators(
		Expose(),
		ApiProperty({ type: 'string', nullable }),
		Type(() => DecimalNumber),
		Transform(({ value }) => value?.toString(), { toPlainOnly: true }),
		Transform(
			({ key, obj }) =>
				!!obj?.[key]
					? new DecimalNumber(obj[key])
					: obj?.[key] === null
						? null
						: undefined,
			{
				toClassOnly: true,
			},
		),
		Field(() => DecimalScalar, { nullable }),
	);
}

export const DecimalScalar = new GraphQLScalarType({
	name: 'DecimalNumber',
	description: 'A decimal number',
	serialize: (value: any) => value.toString(),
	parseValue: (value) => value,
	parseLiteral: (ast: any) => new DecimalNumber(ast),
});

import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AuthProvider } from '../internal/auth-strategy.dto';

registerEnumType(AuthProvider, { name: 'AuthProvider' });

@ObjectType()
export class AuthStrategyDto {
	@Expose()
	@ApiProperty({ enum: AuthProvider, enumName: 'AuthProvider' })
	@Field(() => AuthProvider)
	provider: AuthProvider;

	@Expose()
	@Field()
	name: string;

	@Expose()
	@Field()
	title: string;

	@Expose()
	@Field(() => [String], { nullable: true })
	tags: string[] | null;
}

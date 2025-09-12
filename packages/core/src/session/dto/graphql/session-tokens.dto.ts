import { Field, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

@ObjectType()
export class SessionTokensDto {
	@Expose()
	@Field()
	token: string;

	@Expose()
	@Field()
	expires: string;

	@Expose()
	@Field()
	refreshToken: string;

	@Expose()
	@Field()
	refreshExpires: string;
}

import { Expose } from 'class-transformer';

export class PublicSessionTokensDto {
	@Expose()
	token: string;

	@Expose()
	expires: string;

	@Expose()
	refreshToken: string;

	@Expose()
	refreshExpires: string;
}

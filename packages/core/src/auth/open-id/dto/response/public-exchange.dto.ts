import { Expose } from 'class-transformer';

export class PublicExchangeDto {
	@Expose()
	issuerUrl: string;

	@Expose()
	clientId: string;

	@Expose()
	redirectUrl: string;

	@Expose()
	scope: string;
}

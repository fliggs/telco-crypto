import { Expose } from 'class-transformer';

export class PublicCertificateDto {
	@Expose()
	id: string;

	@Expose()
	phoneNumberMsisdn: string;

	@Expose()
	issuedAt: Date;

	@Expose()
	expiresAt: Date;
}

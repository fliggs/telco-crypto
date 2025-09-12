import { Expose } from 'class-transformer';

export class PublicPortInDataDto {
	@Expose()
	isPortingIn: boolean;

	@Expose()
	msisdn?: string | null;

	@Expose()
	postalCode?: string | null;

	@Expose()
	accountNumber?: string | null;

	@Expose()
	password?: string | null;
}

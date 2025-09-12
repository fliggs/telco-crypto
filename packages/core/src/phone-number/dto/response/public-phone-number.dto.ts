import { Expose } from 'class-transformer';

export class PublicPhoneNumberDto {
	@Expose()
	msisdn: string;
}

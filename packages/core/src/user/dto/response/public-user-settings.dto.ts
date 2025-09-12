import { Expose } from 'class-transformer';

export class PublicUserSettingsDto {
	@Expose()
	email?: boolean;

	@Expose()
	mail?: boolean;

	@Expose()
	sms?: boolean;

	@Expose()
	cpni?: boolean;
}

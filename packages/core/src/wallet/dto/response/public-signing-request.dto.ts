import { Expose } from 'class-transformer';

export class PublicSigningRequestDto {
	@Expose()
	address: string;

	@Expose()
	message: string;
}

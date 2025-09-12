import { Expose } from 'class-transformer';

export class PublicOrderSigningDto {
	@Expose()
	message: string | null;
}

import { Expose } from 'class-transformer';

export class PublicPortInDto {
	@Expose()
	isEligible: boolean;
}

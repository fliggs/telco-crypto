import { Expose } from 'class-transformer';

export class PublicCoverageDto {
	@Expose()
	coverage: number | null;
}

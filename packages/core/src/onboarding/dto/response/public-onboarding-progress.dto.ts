import { Expose } from 'class-transformer';

export class PublicOnboardingProgressDto {
	@Expose()
	id: string;

	@Expose()
	stageName: string;

	@Expose()
	startedAt: Date | null;

	@Expose()
	completedAt: Date | null;
}

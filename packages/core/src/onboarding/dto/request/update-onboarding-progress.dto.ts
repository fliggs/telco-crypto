import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class UpdateOnboardingProgressDto {
	@IsDate()
	@Type(() => Date)
	startedAt: Date | null;

	@IsDate()
	@Type(() => Date)
	completedAt: Date | null;
}

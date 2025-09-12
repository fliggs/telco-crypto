import { Expose } from 'class-transformer';

export class OnboardingEventDto {
	@Expose()
	userId: string;

	@Expose()
	stageName: string;
}

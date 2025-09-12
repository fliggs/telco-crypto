import { IsBoolean, IsString } from 'class-validator';

export class UpdateMyOnboardingProgressDto {
	@IsString()
	stage: string;

	@IsBoolean()
	completed: boolean;

	constructor(partial: Partial<UpdateMyOnboardingProgressDto>) {
		Object.assign(this, partial);
	}
}

import { IsEmail } from 'class-validator';

export class ResetVerifyDto {
	@IsEmail()
	email: string;

	constructor(partial: Partial<ResetVerifyDto>) {
		Object.assign(this, partial);
	}
}

import { IsEmail, IsOptional, IsString } from 'class-validator';

export class VerifyDto {
	@IsEmail()
	email: string;

	@IsString()
	code: string;

	constructor(partial: Partial<VerifyDto>) {
		Object.assign(this, partial);
	}
}

import { IsEmail, IsString } from 'class-validator';

export class ChangeUnverifiedEmailDto {
	@IsEmail()
	oldEmail: string;
	
	@IsEmail()
	newEmail: string;
}

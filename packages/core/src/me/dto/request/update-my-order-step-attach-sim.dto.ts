import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMyOrderStepAttachSimDto {
	@IsString()
	@MinLength(19)
	@MaxLength(20)
	iccid: string;
}

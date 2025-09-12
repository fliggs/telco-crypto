import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMyOrderStepSignDto {
	@IsString()
	signature: string;
}

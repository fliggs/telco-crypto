import { IsOptional, IsString } from 'class-validator';

export class UpdateMySubscriptionDto {
	@IsString()
	@IsOptional()
	label?: string;
}

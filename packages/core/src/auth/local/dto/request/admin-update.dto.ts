import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class AuthLocalAdminUpdateDto {
	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	newPassword: string | null;
}

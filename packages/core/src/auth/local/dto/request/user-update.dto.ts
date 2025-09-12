import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class AuthLocalUserUpdateDto {
	@IsBoolean()
	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	verify: boolean | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	newPassword: string | null;
}

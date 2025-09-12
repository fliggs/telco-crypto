import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UserFilterDto {
	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	email?: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	name?: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	userId?: string | null;
}

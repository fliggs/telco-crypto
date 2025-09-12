import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UserGroupFilterDto {
	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	search?: string;
}

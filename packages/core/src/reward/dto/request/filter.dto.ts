import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class RewardFilterDto {
	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	name?: string | null;
}

import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

@InputType()
export class PlanFilterDto {
	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	name?: string | null;

	@IsBoolean()
	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	isStandalone?: boolean | null;
}

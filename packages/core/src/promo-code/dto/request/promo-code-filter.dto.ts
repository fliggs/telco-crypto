import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class PromoCodeFilterDto {
	@IsString()
	@IsOptional()
	@Field({ nullable: true })
	code?: string;
}

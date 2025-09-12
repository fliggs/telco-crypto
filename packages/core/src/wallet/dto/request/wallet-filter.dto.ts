import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class WalletFilterDto {
	@IsString()
	@IsOptional()
	@Field({ nullable: true })
	address?: string;
}

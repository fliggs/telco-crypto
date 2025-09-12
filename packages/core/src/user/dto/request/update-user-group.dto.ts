import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsOptional } from 'class-validator';

@InputType()
export class UpdateUserGroupDto {
	@IsBoolean()
	@IsOptional()
	@Field(() => Boolean)
	isDefaultGroup?: boolean;

	@IsBoolean()
	@IsOptional()
	@Field(() => Boolean)
	isNewWalletEnabled?: boolean;

	@IsBoolean()
	@IsOptional()
	@Field(() => Boolean)
	isPromoCodeFieldEnabled?: boolean;
}

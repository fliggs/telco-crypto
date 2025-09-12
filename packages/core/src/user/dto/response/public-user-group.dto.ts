import { Expose } from 'class-transformer';

export class PublicUserGroupDto {
	@Expose()
	isNewWalletEnabled: boolean;

	@Expose()
	isPromoCodeFieldEnabled: boolean;
}

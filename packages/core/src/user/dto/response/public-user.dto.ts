import { Expose, Type } from 'class-transformer';
import { UserGroup } from '@prisma/client';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';

import { PublicUserSettingsDto } from './public-user-settings.dto';
import { PublicUserGroupDto } from './public-user-group.dto';

export class PublicUserDto {
	@Expose()
	id: string;

	@Expose()
	createdAt: Date;

	@Expose()
	email: string;

	@Expose()
	firstName: string;

	@Expose()
	lastName: string;

	@Expose()
	@Type(() => PublicUserSettingsDto)
	settings: PublicUserSettingsDto;

	@Expose({ toClassOnly: true }) // Only expose when converting to object (internally) and then remove when returning to clients (externally)
	@ApiHideProperty()
	@Type(() => PublicUserGroupDto)
	group: UserGroup;

	@Expose()
	@ApiProperty({ type: () => Boolean })
	isNewWalletEnabled() {
		return this.group?.isNewWalletEnabled;
	}

	@Expose()
	@ApiProperty({ type: () => Boolean })
	isPromoCodeFieldEnabled() {
		return this.group?.isPromoCodeFieldEnabled;
	}
}

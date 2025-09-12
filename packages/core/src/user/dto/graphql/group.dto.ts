import { Paginated } from '@/paginated';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserGroupDto {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field()
	isDefaultGroup: boolean;

	@Field()
	isNewWalletEnabled: boolean;

	@Field()
	isPromoCodeFieldEnabled: boolean;
}

@ObjectType()
export class PaginatedUserGroups extends Paginated(UserGroupDto) {}

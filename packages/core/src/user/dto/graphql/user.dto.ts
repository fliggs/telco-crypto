import { Paginated } from '@/paginated';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	email: string;

	@Field()
	firstName: string;

	@Field()
	lastName: string;

	@Field(() => Date, { nullable: true })
	deletedAt: Date | null;

	@Field(() => String, { nullable: true })
	groupId: string | null;
}

@ObjectType()
export class PaginatedUsers extends Paginated(UserDto) {}

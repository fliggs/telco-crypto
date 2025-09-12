import { Paginated } from '@/paginated';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AdminDto {
	@Field()
	id: string;

	@Field()
	email: string;

	@Field()
	firstName: string;

	@Field()
	lastName: string;

	@Field(() => Date, { nullable: true })
	deletedAt: Date | null;
}

@ObjectType()
export class PaginatedAdmins extends Paginated(AdminDto) {}

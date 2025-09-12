import { Paginated } from '@/paginated';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PhoneNumberAssignmentDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	deletedAt: Date | null;
}

@ObjectType()
export class PaginatedPhoneNumberAssignments extends Paginated(
	PhoneNumberAssignmentDto,
) {}

import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from '@/paginated';
import { Content } from '@/content/dto/internal/content.dto';
import { ContentDto } from '@/content/dto/graphql/content.dto';

@ObjectType()
export class PromoCodeDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field()
	code: string;

	@Field()
	isActive: boolean;

	@Field(() => Int, { nullable: true })
	maxActivations: number | null;

	@Field(() => Int, { nullable: true })
	usedActivations: number | null;

	@Field(() => String, { nullable: true })
	receiverEmail: string | null;

	@Field(() => Date, { nullable: true })
	validFrom: Date | null;

	@Field(() => Date, { nullable: true })
	validUntil: Date | null;

	@Field(() => String, { nullable: true })
	ownerId: string | null;

	@Field(() => String, { nullable: true })
	receiverId: string | null;

	@Field(() => ContentDto)
	content: Content;
}

@ObjectType()
export class PaginatedPromoCodes extends Paginated(PromoCodeDto) {}

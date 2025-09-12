import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { RewardType } from '@prisma/client';

import { Paginated } from '@/paginated';
import { Content } from '@/content/dto/internal/content.dto';
import { ContentDto } from '@/content/dto/graphql/content.dto';

registerEnumType(RewardType, { name: 'RewardType' });

@ObjectType()
export class RewardDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field()
	name: string;

	@Field(() => RewardType)
	type: RewardType;

	@Field()
	isActive: boolean;

	@Field(() => Date, { nullable: true })
	validFrom: Date | null;

	@Field(() => Date, { nullable: true })
	validUntil: Date | null;

	@Field(() => ContentDto)
	content: Content;
}

@ObjectType()
export class PaginatedRewards extends Paginated(RewardDto) {}

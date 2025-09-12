import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Content } from '@/content/dto/internal/content.dto';
import { ContentDto } from '@/content/dto/graphql/content.dto';
import { Paginated } from '@/paginated';

@ObjectType()
export class PlanDto {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field(() => Int)
	version: number;

	@Field()
	isStandalone: boolean;

	@Field()
	validForSeconds: number;

	@Field()
	doesAutoRenew: boolean;

	@Field(() => ContentDto)
	content: Content;
}

@ObjectType()
export class PaginatedPlans extends Paginated(PlanDto) {}

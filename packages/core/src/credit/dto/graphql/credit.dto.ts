import { Prisma } from '@prisma/client';
import { Field, ObjectType } from '@nestjs/graphql';

import { DecimalScalar } from '@/decimal.dto';
import { Paginated } from '@/paginated';
import { ContentDto } from '@/content/dto/graphql/content.dto';

@ObjectType()
export class CreditDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field(() => DecimalScalar)
	providedCost: Prisma.Decimal;

	@Field(() => DecimalScalar)
	usedCost: Prisma.Decimal;

	@Field(() => String, { nullable: true })
	subscriptionId: string | null;

	@Field(() => ContentDto)
	content: ContentDto;
}

@ObjectType()
export class PaginatedCredits extends Paginated(CreditDto) {}

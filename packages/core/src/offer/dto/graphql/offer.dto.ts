import { Field, Int, ObjectType } from '@nestjs/graphql';

import { Paginated } from '@/paginated';
import { DecimalNumber, DecimalScalar } from '@/decimal.dto';
import { Content } from '@/content/dto/internal/content.dto';
import { ContentDto } from '@/content/dto/graphql/content.dto';

@ObjectType()
export class OfferDto {
	@Field()
	id: string;

	@Field()
	legalId: string;

	@Field()
	name: string;

	@Field()
	version: number;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => Int)
	sort: number;

	@Field()
	isActive: boolean;

	@Field()
	isPublic: boolean;

	@Field(() => Date, { nullable: true })
	validFrom: Date | null;

	@Field(() => Date, { nullable: true })
	validUntil: Date | null;

	@Field(() => DecimalScalar)
	cost: DecimalNumber;

	@Field(() => DecimalScalar, { nullable: true })
	originalCost: DecimalNumber | null;

	@Field(() => DecimalScalar, { nullable: true })
	providedCredits: DecimalNumber | null;

	@Field()
	planId: string;

	@Field(() => ContentDto)
	content: Content;
}

@ObjectType()
export class PaginatedOffers extends Paginated(OfferDto) {}

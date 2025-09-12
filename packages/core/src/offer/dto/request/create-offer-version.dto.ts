import { Type } from 'class-transformer';
import { Field, InputType, Int } from '@nestjs/graphql';
import {
	IsBoolean,
	IsDateString,
	IsInstance,
	IsNumber,
	IsString,
	ValidateIf,
} from 'class-validator';

import { Decimal, DecimalNumber } from '@/decimal.dto';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';

@InputType()
export class CreateOfferVersionDto {
	@IsString()
	@Field()
	planId: string;

	@IsNumber()
	@Field(() => Int)
	sort: number;

	@IsBoolean()
	@Field()
	isActive: boolean;

	@IsBoolean()
	@Field()
	isPublic: boolean;

	@IsDateString()
	@ValidateIf((_, value) => value !== null)
	@Field(() => Date, { nullable: true })
	validFrom: Date | null;

	@IsDateString()
	@ValidateIf((_, value) => value !== null)
	@Field(() => Date, { nullable: true })
	validUntil: Date | null;

	@Decimal(true)
	@ValidateIf((_, value) => value !== null)
	@IsInstance(DecimalNumber)
	originalCost: DecimalNumber | null;

	@Decimal()
	@IsInstance(DecimalNumber)
	cost: DecimalNumber;

	@Decimal(true)
	@ValidateIf((_, value) => value !== null)
	@IsInstance(DecimalNumber)
	providedCredits: DecimalNumber | null;

	@IsInstance(ContentInputDto)
	@Field(() => ContentInputDto)
	@Type(() => ContentInputDto)
	content: ContentInputDto;
}

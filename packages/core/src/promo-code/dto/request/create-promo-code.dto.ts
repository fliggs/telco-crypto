import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsDateString,
	IsEmail,
	IsInstance,
	IsInt,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';
import { Field, InputType, Int } from '@nestjs/graphql';

import { PublicContentDto } from '@/content/dto/response/public-content.dto';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';

@InputType()
export class CreatePromoCodeDto {
	@IsString()
	@Field()
	code: string;

	@IsBoolean()
	@Field()
	isActive: boolean;

	@IsInt()
	@ValidateIf((_, value) => value !== null)
	@Field(() => Int, { nullable: true })
	maxActivations: number | null;

	@IsEmail()
	@ValidateIf((_, value) => value !== null)
	@Field(() => String, { nullable: true })
	receiverEmail: string | null;

	@IsDateString()
	@ValidateIf((_, value) => value !== null)
	@Field(() => Date, { nullable: true })
	validFrom: Date | null;

	@IsDateString()
	@ValidateIf((_, value) => value !== null)
	@Field(() => Date, { nullable: true })
	validUntil: Date | null;

	@IsString({ each: true })
	@Field(() => [String])
	offerIds: string[];

	@ValidateNested()
	@IsInstance(PublicContentDto)
	@Type(() => PublicContentDto)
	@Field(() => ContentInputDto)
	content: ContentInputDto;
}

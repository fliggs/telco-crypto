import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { RewardType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsInstance,
	IsString,
	ValidateIf,
	ValidateNested,
} from 'class-validator';

import { ContentInputDto } from '@/content/dto/request/content-input.dto';

registerEnumType(RewardType, { name: 'RewardType' });

@InputType()
export class CreateRewardDto {
	@IsString()
	@Field()
	name: string;

	@IsEnum(RewardType)
	@Field(() => RewardType)
	type: RewardType;

	@IsBoolean()
	@Field()
	isActive: boolean;

	@IsDateString()
	@ValidateIf((_, value) => value !== null)
	@Field(() => Date, { nullable: true })
	validFrom: Date | null;

	@IsDateString()
	@ValidateIf((_, value) => value !== null)
	@Field(() => Date, { nullable: true })
	validUntil: Date | null;

	@ValidateNested()
	@IsInstance(ContentInputDto)
	@Field(() => ContentInputDto)
	@Type(() => ContentInputDto)
	content: ContentInputDto;

	@IsString()
	@Field()
	data: string;
}

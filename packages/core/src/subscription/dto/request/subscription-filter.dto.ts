import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { SubscriptionStatus } from '@prisma/client';
import {
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	MaxLength,
} from 'class-validator';

registerEnumType(SubscriptionStatus, { name: 'SubscriptionStatus' });

@InputType()
export class SubscriptionFilterDto {
	@IsEnum(SubscriptionStatus)
	@IsOptional()
	@Field(() => SubscriptionStatus, { nullable: true })
	status?: SubscriptionStatus | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	msisdn?: string | null;

	@IsString()
	@MaxLength(20)
	@IsOptional()
	@Field(() => String, { nullable: true })
	iccid?: string | null;

	@IsBoolean()
	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	hasParent?: boolean | null;

	@IsString()
	@MaxLength(20)
	@IsOptional()
	@Field(() => String, { nullable: true })
	email?: string | null;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	id?: string | null;
}

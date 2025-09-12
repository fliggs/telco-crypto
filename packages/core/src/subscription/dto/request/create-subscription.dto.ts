import { Field, InputType } from '@nestjs/graphql';
import { SimType, SubscriptionStatus } from '@prisma/client';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export class CreateSubscriptionDto {
	@IsString()
	@Field()
	userId: string;

	@IsString()
	@Field()
	offerId: string;

	@IsEnum(SubscriptionStatus)
	@Field(() => SubscriptionStatus)
	status: SubscriptionStatus;

	@IsString()
	@Field()
	msisdn: string;

	@IsEnum(SimType)
	@Field(() => SimType)
	simType: SimType;

	@IsString()
	@Field()
	iccid: string;

	@IsDate()
	@Field()
	startAt: Date;

	@IsUUID()
	@IsOptional()
	@Field(() => String, { nullable: true })
	parentId?: string | null;
}

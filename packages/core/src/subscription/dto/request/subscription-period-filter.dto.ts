import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { SubscriptionPeriodStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

registerEnumType(SubscriptionPeriodStatus, {
	name: 'SubscriptionPeriodStatus',
});

@InputType()
export class SubscriptionPeriodFilterDto {
	@IsEnum(SubscriptionPeriodStatus)
	@IsOptional()
	@Field(() => SubscriptionPeriodStatus, { nullable: true })
	status: SubscriptionPeriodStatus | null;
}

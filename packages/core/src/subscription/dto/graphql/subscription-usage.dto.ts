import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { VolumeType } from '@prisma/client';

import { Decimal, DecimalNumber } from '@/decimal.dto';

registerEnumType(VolumeType, { name: 'VolumeType' });

@ObjectType()
export class SubscriptionUsageDto {
	@Field()
	id: string;

	@Field(() => VolumeType)
	type: VolumeType;

	@Field()
	isUnlimited: boolean;

	@Field()
	isRoaming: boolean;

	@Decimal()
	amount: DecimalNumber;

	@Decimal(true)
	total: DecimalNumber | null;
}

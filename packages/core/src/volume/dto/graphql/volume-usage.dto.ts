import { VolumeType } from '@prisma/client';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { Decimal, DecimalNumber } from '@/decimal.dto';

registerEnumType(VolumeType, { name: 'VolumeType' });

@ObjectType()
export class VolumeUsageDto {
	@Field(() => VolumeType)
	type: VolumeType;

	@Field()
	isUnlimited: boolean;

	@Field()
	isRoaming: boolean;

	@Decimal()
	amountTotal: DecimalNumber;

	@Decimal()
	amountUsed: DecimalNumber;

	@Field(() => String, { nullable: true })
	subscriptionId?: string;
}

import { VolumeType } from '@prisma/client';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { DecimalNumber, DecimalScalar } from '@/decimal.dto';

registerEnumType(VolumeType, { name: 'VolumeType' });

@ObjectType()
export class VolumeDto {
	@Field()
	id: string;

	@Field(() => VolumeType)
	type: VolumeType;

	@Field()
	isUnlimited: boolean;

	@Field()
	isRoaming: boolean;

	@Field(() => DecimalScalar)
	amount: DecimalNumber;
}

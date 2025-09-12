import { VolumeType } from '@prisma/client';

import { DecimalNumber } from '@/decimal.dto';

export interface VolumeUsageDto {
	type: VolumeType;
	isUnlimited: boolean;
	isRoaming: boolean;
	amountTotal: DecimalNumber;
	amountUsed: DecimalNumber;
	subscriptionId: string;
}

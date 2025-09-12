import { SimType } from '@prisma/client';

export interface CreateChangeSimDto {
	subId: string;
	simType: SimType;
	iccid: string | null | undefined;
}

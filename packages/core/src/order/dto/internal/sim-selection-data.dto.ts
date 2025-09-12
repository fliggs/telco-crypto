import { SimType } from '@prisma/client';

export interface OrderSimSelectionDataDto {
	simType: SimType;
	iccid?: string | null;
}

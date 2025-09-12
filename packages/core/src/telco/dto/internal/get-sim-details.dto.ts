import { SimType } from '@prisma/client';

export interface GetSimDetailsDto {
	type: SimType;
	iccid: string;
}

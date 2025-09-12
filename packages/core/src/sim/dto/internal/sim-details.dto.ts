import { SimType } from '@prisma/client';

export interface SimDetailsDto {
	iccid: string;
	type: SimType;
	isActivated: boolean;
	status: string;
	eSimStatus: string | null;
	eSimActivationCode: string | null;
}

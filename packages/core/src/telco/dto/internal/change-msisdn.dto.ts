import { Address, User } from '@prisma/client';

export interface ChangeMsisdnDto {
	user: User;
	addresses: Address[];
	iccid: string;
	oldMsisdn: string;
	newMsisdn: string | null | undefined;
	ospAccountNumber?: string | null;
	ospPassword?: string | null;
	ospPostalCode?: string | null;
}

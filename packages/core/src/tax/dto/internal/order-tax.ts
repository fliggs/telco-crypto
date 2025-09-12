import { Address, Offer, Plan, User } from '@prisma/client';

export interface GetTaxForOrderDto {
	orderId: string;
	user: User;
	offer: Offer | null;
	addresses: Address[];
}

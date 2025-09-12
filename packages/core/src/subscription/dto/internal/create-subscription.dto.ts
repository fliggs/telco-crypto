import { SimType, SubscriptionStatus } from '@prisma/client';

export interface CreateSubscriptionDto {
	userId: string;
	offerId: string;

	status?: SubscriptionStatus;
	parentId?: string | null;
	orderId?: string;
	start?: Date;
	msisdn?: string;
	iccid?: string;
	simType?: SimType;
}

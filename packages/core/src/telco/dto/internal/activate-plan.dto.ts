import { Address, Plan, User, Volume } from '@prisma/client';

import { OrderPortInDataDto } from '@/order/dto/internal/port-in-data.dto';

export interface ActivatePlanDto {
	user: User;
	plan: Plan;
	expiresAt: Date;
	volumes: Volume[];
	iccid: string | null;
	msisdn: string | null;
	addresses: Address[];
	isRenewal: boolean;
	portIn: Omit<OrderPortInDataDto, 'isPortingIn'> | null;
}

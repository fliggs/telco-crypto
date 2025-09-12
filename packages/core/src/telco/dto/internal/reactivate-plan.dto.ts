import { Plan, Volume } from '@prisma/client';

export interface ReactivatePlanDto {
	iccid: string;
	msisdn: string;
	plan: Plan;
	expiresAt: Date;
	volumes: Volume[];
}

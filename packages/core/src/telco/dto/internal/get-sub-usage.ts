import { Offer, Plan, Subscription, Volume } from '@prisma/client';

export interface SubscriptionWithVolumes extends Subscription {
	offer: Offer & {
		plan: Plan & {
			volumes: Volume[];
		};
	};
}

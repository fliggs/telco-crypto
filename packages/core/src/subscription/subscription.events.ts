import { EventType } from '@/events/event-type.model';

import { SubscriptionDto } from './dto/transfer/subscription.dto';

export const SUBSCRIPTION_EVENT_CREATED = new EventType(
	'subscription.created',
	SubscriptionDto,
);

export const SUBSCRIPTION_EVENT_ACTIVATED = new EventType(
	'subscription.activated',
	SubscriptionDto,
);

export const SUBSCRIPTION_EVENT_CANCELLED = new EventType(
	'subscription.cancelled',
	SubscriptionDto,
);

export const SUBSCRIPTION_EVENT_UNCANCELLED = new EventType(
	'subscription.uncancelled',
	SubscriptionDto,
);

export const SUBSCRIPTION_EVENT_DEACTIVATED = new EventType(
	'subscription.deactivated',
	SubscriptionDto,
);

export const SUBSCRIPTION_EVENT_SUSPENDED = new EventType(
	'subscription.suspended',
	SubscriptionDto,
);

export const SUBSCRIPTION_EVENT_REACTIVATED = new EventType(
	'subscription.reactivated',
	SubscriptionDto,
);

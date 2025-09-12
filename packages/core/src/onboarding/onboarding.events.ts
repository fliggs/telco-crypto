import { EventType } from '@/events/event-type.model';

import { OnboardingEventDto } from './dto/transfer/onboarding-event.dto';

export const ONBOARDING_EVENT_STARTED = new EventType(
	'onboarding.started',
	OnboardingEventDto,
);

export const ONBOARDING_EVENT_COMPLETED = new EventType(
	'onboarding.completed',
	OnboardingEventDto,
);

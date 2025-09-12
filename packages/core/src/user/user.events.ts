import { EventType } from '@/events/event-type.model';

import { UserDto } from './dto/transfer/user.dto';

export const USER_EVENT_CREATED = new EventType('user.created', UserDto);

export const USER_EVENT_VERIFIED = new EventType('user.verified', UserDto);

export const USER_EVENT_DELETED = new EventType('user.deleted', UserDto);

import { EventType } from '@/events/event-type.model';

import { OrderDto } from './dto/graphql/order.dto';

export const ORDER_EVENT_CREATED = new EventType('order.created', OrderDto);
export const ORDER_EVENT_CONFIRMED = new EventType('order.confirmed', OrderDto);
export const ORDER_EVENT_COMPLETED = new EventType('order.completed', OrderDto);
export const ORDER_EVENT_ERRORED = new EventType('order.errored', OrderDto);
export const ORDER_EVENT_ABORTED = new EventType('order.aborted', OrderDto);

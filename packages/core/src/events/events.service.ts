import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ClassConstructor } from 'class-transformer';
import { Prisma } from '@prisma/client';

import { EventType } from './event-type.model';

// This class exists mostly to give us a stronger types events system.
// It also takes care of logging the events and streamlines our access to emit them
@Injectable()
export class EventsService {
	protected readonly logger = new Logger(EventsService.name);

	constructor(private readonly eventEmitter: EventEmitter2) {}

	async emit<T extends ClassConstructor<any>, E extends EventType<T>>(
		eventType: E,
		data: InstanceType<E['type']>,
	) {
		this.logger.debug(
			`[EVENT] [${eventType.name}] ${JSON.stringify(data, this.serialize)}`,
		);
		return this.eventEmitter.emitAsync(eventType.name, data);
	}

	private serialize(key: string, value: any) {
		if (typeof value === 'bigint') {
			return value.toString();
		} else if (value instanceof Prisma.Decimal) {
			return value.toString();
		}
		return value;
	}
}

import { ClassConstructor } from 'class-transformer';
import { OnEvent as OrigOnEvent } from '@nestjs/event-emitter';

import { EventType } from './event-type.model';

export function OnEvent<
	T extends ClassConstructor<any>,
	E extends EventType<T>,
>(type: E) {
	return <C extends Object>(
		target: C,
		// The following complicated typing tries to ensure that the method arguments match the expected
		// event parameters, but it doesn't work 100%. Close enough for most cases
		prop: {
			[K in keyof C]-?: K extends number
				? never
				: C[K] extends (data: InstanceType<E['type']>) => void | Promise<void>
					? K
					: never;
		}[keyof C],
		descriptor: PropertyDescriptor,
	) => {
		if (!type) {
			throw new Error(
				`EventType missing: Check circular dependencies for ${target.constructor.name}::${String(prop)}`,
			);
		}
		OrigOnEvent(type.name, { async: true })(target, prop, descriptor);
	};
}

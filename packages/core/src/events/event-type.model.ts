import { ClassConstructor } from 'class-transformer';

export class EventType<T extends ClassConstructor<any>> {
	readonly name: string;
	readonly type: T;

	constructor(name: string, type: T) {
		this.name = name;
		this.type = type;
	}
}

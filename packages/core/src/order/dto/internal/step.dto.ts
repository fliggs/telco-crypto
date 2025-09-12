import { OrderRun } from '@prisma/client';

import { OrderWithDetails, ProcessorResult } from '@/order/order.processor';

export abstract class Step<T = unknown> {
	public abstract readonly name: string;

	constructor(protected readonly config: T) {}

	public abstract run(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult>;

	public abstract abort(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult>;
}

export abstract class StepFactory<T = unknown, U extends Step<T> = Step<T>> {
	public abstract create(config: T): U;
}

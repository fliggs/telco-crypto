import { OrderRun } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { Step, StepFactory } from '@/order/dto/internal/step.dto';
import { OrderWithDetails, ProcessorResult } from '@/order/order.processor';

export interface SimpleStepConfig {
	name: string;
	run(order: OrderWithDetails, run: OrderRun): Promise<ProcessorResult>;
	abort(order: OrderWithDetails, run: OrderRun): Promise<ProcessorResult>;
}

export class SimpleStep extends Step<SimpleStepConfig> {
	public readonly name = this.config.name;

	public run(order: OrderWithDetails, run: OrderRun): Promise<ProcessorResult> {
		return this.config.run(order, run);
	}

	public abort(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {
		return this.config.abort(order, run);
	}
}

@Injectable()
export class SimpleStepFactory extends StepFactory<SimpleStepConfig> {
	public create(config: SimpleStepConfig): SimpleStep {
		return new SimpleStep(config);
	}
}

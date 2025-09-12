import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderRun } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { OrderRunDto } from './dto/graphql/order-run.dto';
import { OrderRunStepDto } from './dto/graphql/order-run-step.dto';
import { OrderRunStepLoader } from './order-run-step.loader';
import { OrderRunService } from './order-run.service';

@Resolver(() => OrderRunDto)
export class OrderRunResolver {
	constructor(
		private readonly orderRunService: OrderRunService,
		private readonly orderRunStepLoader: OrderRunStepLoader,
	) {}

	@AdminAccess()
	@Query(() => OrderRunDto)
	async orderRun(
		@Args('id', { type: () => String })
		id: string,
	): Promise<OrderRunDto> {
		return this.orderRunService.findOne(id);
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async result(@Parent() run: OrderRun): Promise<string | null> {
		return run.result ? JSON.stringify(run.result) : null;
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async error(@Parent() run: OrderRun): Promise<string | null> {
		return run.error ? JSON.stringify(run.error) : null;
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async formattedError(@Parent() run: OrderRun): Promise<string | null> {
		if (!run.error) {
			return null;
		}

		// Try doing a little bit of error parsing
		if (typeof run.error === 'object') {
			if (
				'response' in run.error &&
				typeof run.error.response === 'object' &&
				run.error.response
			) {
				if ('message' in run.error.response) {
					return `${run.error.response.message}`;
				}
			} else if (
				'raw' in run.error &&
				typeof run.error.raw === 'object' &&
				run.error.raw
			) {
				if ('code' in run.error.raw) {
					return `${run.error.raw.code}`;
				}
			} else if ('message' in run.error) {
				return `${run.error.message}`;
			}
		}

		return JSON.stringify(run.error);
	}

	@AdminAccess()
	@ResolveField(() => OrderRunStepDto, { nullable: true })
	async currentStep(@Parent() run: OrderRun): Promise<OrderRunStepDto | null> {
		return run.stepNo
			? this.orderRunStepLoader.currentByRunId.load([run.id, run.stepNo])
			: null;
	}

	@AdminAccess()
	@ResolveField(() => [OrderRunStepDto])
	async steps(@Parent() run: OrderRun): Promise<OrderRunStepDto[]> {
		return this.orderRunStepLoader.byRunId.load(run.id);
	}
}

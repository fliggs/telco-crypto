import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderStep } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { OrderStepDto } from './dto/graphql/order-step.dto';

@Resolver(() => OrderStepDto)
export class OrderStepResolver {
	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async result(@Parent() run: OrderStep): Promise<string | null> {
		return run.result ? JSON.stringify(run.result) : null;
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async error(@Parent() run: OrderStep): Promise<string | null> {
		return run.error ? JSON.stringify(run.error) : null;
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async formattedError(@Parent() run: OrderStep): Promise<string | null> {
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
}

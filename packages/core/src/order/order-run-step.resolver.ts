import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { OrderRunStep } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';

import { OrderRunStepDto } from './dto/graphql/order-run-step.dto';

@Resolver(() => OrderRunStepDto)
export class OrderRunStepResolver {
	constructor() {}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async result(@Parent() step: OrderRunStep): Promise<string | null> {
		return step.result ? JSON.stringify(step.result) : null;
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async error(@Parent() step: OrderRunStep): Promise<string | null> {
		return step.error ? JSON.stringify(step.error) : null;
	}

	@AdminAccess()
	@ResolveField(() => String, { nullable: true })
	async formattedError(@Parent() step: OrderRunStep): Promise<string | null> {
		if (!step.error) {
			return null;
		}

		// Try doing a little bit of error parsing
		if (typeof step.error === 'object') {
			if (
				'response' in step.error &&
				typeof step.error.response === 'object' &&
				step.error.response
			) {
				if ('message' in step.error.response) {
					return `${step.error.response.message}`;
				}
			} else if (
				'raw' in step.error &&
				typeof step.error.raw === 'object' &&
				step.error.raw
			) {
				if ('code' in step.error.raw) {
					return `${step.error.raw.code}`;
				}
			} else if ('message' in step.error) {
				return `${step.error.message}`;
			}
		}

		return JSON.stringify(step.error);
	}
}

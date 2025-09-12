import {
	Injectable,
	CanActivate,
	ExecutionContext,
	Logger,
	ClassSerializerContextOptions,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType } from '@nestjs/graphql';

import { ACCESS_KEY } from './access.decorator';
import { Access } from './access.enum';

/**
 * This guard is applied globally and blocks access to any routes that don't have an access annotation.
 * It's here to protect ourselves from accidentally leaving routes exposed.
 * TODO: We could move the checks from this guard into a static analysis that runs at server startup,
 * then we could also use it during build-time.
 */
@Injectable()
export class AccessGlobalGuard implements CanActivate {
	protected readonly logger = new Logger(AccessGlobalGuard.name);

	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const type = context.getType<GqlContextType>();

		const clazz = context.getClass().name;
		const func = context.getHandler().name;
		const path = `${clazz}::${func}`;

		const accesses = this.reflector.getAllAndMerge<Access[]>(ACCESS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		// Don't allow access to unprotected routes
		if (accesses.length === 0) {
			this.logger.warn(`Missing access annotation for ${path}`);
			return false;
		}

		// For REST: don't allow access to public or user routes that don't return a "Public...Dto" object
		if (
			type === 'http' &&
			(accesses.includes(Access.Public) || accesses.includes(Access.User))
		) {
			const options =
				this.reflector.getAllAndOverride<ClassSerializerContextOptions>(
					'class_serializer:options',
					[context.getHandler(), context.getClass()],
				);

			if (
				options?.type &&
				!options.type.name.startsWith('Public') &&
				options.type !== String &&
				options.type !== Number &&
				options.type !== Boolean
			) {
				this.logger.error(
					`Route ${path} does not return a 'Public...Dto' type`,
				);
				return false;
			}
		}

		return true;
	}
}

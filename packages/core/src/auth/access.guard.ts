import {
	Injectable,
	CanActivate,
	ExecutionContext,
	Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

import { ACCESS_KEY } from './access.decorator';
import { Access } from './access.enum';

@Injectable()
export class AccessGuard implements CanActivate {
	protected readonly logger = new Logger(AccessGuard.name);

	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const accesses = this.reflector.getAllAndMerge<Access[]>(ACCESS_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const request = this.getRequest(context);
		const user = request.user;

		if (accesses.length === 0) {
			this.logger.warn(
				`Missing access annotation for route ${context.switchToHttp().getRequest().url}`,
			);
			return false;
		}

		for (const access of accesses) {
			switch (access) {
				case Access.Public: {
					return true;
				}

				case Access.User: {
					if (user && !user.isAdmin) {
						return true;
					}
					break;
				}

				case Access.Admin: {
					if (user && user.isAdmin) {
						return true;
					}
					break;
				}
			}
		}

		return false;
	}

	getRequest(context: ExecutionContext): Request {
		const type = context.getType<GqlContextType>();
		if (type === 'graphql') {
			const ctx = GqlExecutionContext.create(context);
			const request = ctx.getContext().req;
			return request;
		}

		return context.switchToHttp().getRequest();
	}
}

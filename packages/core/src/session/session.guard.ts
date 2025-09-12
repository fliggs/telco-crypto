import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

import { SessionService } from './session.service';

@Injectable()
export class SessionGuard implements CanActivate {
	constructor(private readonly sessionService: SessionService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = this.getRequest(context);

		const token = this.extractTokenFromHeader(request);
		if (token) {
			request.token = token;
			request.user = await this.sessionService.verify(token).catch(() => null);
		} else if (request.session.auth) {
			let provider = request.headers['x-auth-provider'];
			if (typeof provider !== 'string' || !request.session.auth[provider]) {
				provider = Object.keys(request.session.auth)[0];
			}

			if (provider) {
				let strategy = request.headers['x-auth-strategy'];
				if (
					typeof strategy !== 'string' ||
					!request.session.auth[provider][strategy]
				) {
					strategy = Object.keys(request.session.auth[provider])[0];
				}

				if (strategy) {
					request.user = request.session.auth[provider][strategy].user;
				}
			}
		}

		// Make sure the property is never undefined
		if (!request.user) {
			request.user = null;
		}

		return true;
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}

	private getRequest(context: ExecutionContext): Request {
		const type = context.getType<GqlContextType>();
		if (type === 'graphql') {
			const ctx = GqlExecutionContext.create(context);
			const request = ctx.getContext().req;
			return request;
		}

		return context.switchToHttp().getRequest();
	}
}

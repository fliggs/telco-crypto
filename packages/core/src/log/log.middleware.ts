import {
	CallHandler,
	ExecutionContext,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { inspect } from 'node:util';
import { Observable, tap } from 'rxjs';

function fmt(obj: any) {
	return blurCredentials(
		inspect(obj, {
			depth: null,
			compact: true,
			maxArrayLength: null,
			maxStringLength: null,
			breakLength: Infinity,
		}),
	);
}

function blurCredentials(msg: string) {
	return msg
		.replace(
			/(["']?\w*)token(\w*["']?\s*):(\s*["']).*(["'])/gi,
			`$1token$2:$3********$4`,
		)
		.replace(
			/(["']?\w*)password(\w*["']?\s*):(\s*["']).*(["'])/gi,
			`$1password$2:$3********$4`,
		);
}

@Injectable()
export class LogMiddleware implements NestInterceptor {
	protected readonly logger = new Logger(LogMiddleware.name);

	intercept(
		context: ExecutionContext,
		next: CallHandler<any>,
	): Observable<any> | Promise<Observable<any>> {
		const { req, res } = this.getRequestResponse(context);
		const { ip, originalUrl, method, params, query, body } = req;

		const start = performance.now();
		const addr = req.header('X-Forwarded-For') ?? ip;

		const reqParams = fmt(params);
		const reqQuery = fmt(query);
		const reqStr = fmt(body);

		const id = randomUUID();
		this.logger.log(
			`${addr} --> ${id} ${method} ${originalUrl} ${reqParams} ${reqQuery} ${reqStr}`,
		);

		return next.handle().pipe(
			tap({
				next: (data) => {
					const { statusCode } = res;
					const diff = Math.round(performance.now() - start);
					const resStr = fmt(data);
					const str = `${addr} <-- ${id} ${method} ${originalUrl} ${statusCode} ${diff}ms ${resStr}`;
					this.logger.log(str);
				},
				error: (data) => {
					const { statusCode } = res;
					const diff = Math.round(performance.now() - start);
					const resStr = fmt(data);
					const str = `${addr} <-- ${id} ${method} ${originalUrl} ${statusCode} ${diff}ms ${resStr}`;
					this.logger.error(str);
				},
			}),
		);
	}

	getRequestResponse(context: ExecutionContext): {
		req: Request;
		res: Response;
	} {
		const type = context.getType<GqlContextType>();
		if (type === 'graphql') {
			const gqlCtx = GqlExecutionContext.create(context);
			const ctx = gqlCtx.getContext();
			return { req: ctx.req, res: ctx.res };
		}

		const ctx = context.switchToHttp();
		return { req: ctx.getRequest(), res: ctx.getResponse() };
	}
}

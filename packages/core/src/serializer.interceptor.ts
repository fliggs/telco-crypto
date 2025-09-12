import {
	CallHandler,
	ClassSerializerInterceptor,
	ExecutionContext,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Observable } from 'rxjs';

export class CustomClassSerializerInterceptor extends ClassSerializerInterceptor {
	override intercept(
		context: ExecutionContext,
		next: CallHandler,
	): Observable<any> {
		if (context.getType<GqlContextType>() === 'graphql') {
			return next.handle();
		}
		return super.intercept(context, next);
	}
}

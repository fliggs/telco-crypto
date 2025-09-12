import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';

import { LoggedInSubject } from './dto/internal/logged-in-subject.dto';

// Re-export to make importing easier, because using this decorator will always require this type
export { LoggedInSubject };

export const LoggedIn = createParamDecorator<ExecutionContext, LoggedInSubject>(
	(data: unknown, ctx: ExecutionContext) => {
		return ctx.getType<GqlContextType>() === 'graphql'
			? GqlExecutionContext.create(ctx).getContext().req.user
			: ctx.switchToHttp().getRequest().user;
	},
);

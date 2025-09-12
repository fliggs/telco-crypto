import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UserAuthData } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';
import { AuthProvider } from '@/auth/dto/internal/auth-strategy.dto';

import { UserAuthDataDto } from './dto/graphql/auth-data.dto';

@Resolver(() => UserAuthDataDto)
export class UserAuthDataResolver {
	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() parent: UserAuthData): Promise<string> {
		let data: any = parent.data;

		// TODO: We could turn this into a "sanitize" function defined for every auth provider and then call it generically
		if (parent.provider === AuthProvider.Local) {
			const { password, ...rest } = parent.data as any;
			data = rest;
		}

		return JSON.stringify(data);
	}
}

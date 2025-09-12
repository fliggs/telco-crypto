import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { AdminAuthData } from '@prisma/client';

import { AdminAccess } from '@/auth/access.decorator';
import { AuthProvider } from '@/auth/dto/internal/auth-strategy.dto';

import { AdminAuthDataDto } from './dto/graphql/auth-data.dto';

@Resolver(() => AdminAuthDataDto)
export class AdminAuthDataResolver {
	@AdminAccess()
	@ResolveField(() => String)
	async data(@Parent() parent: AdminAuthData): Promise<string> {
		let data: any = parent.data;

		// TODO: We could turn this into a "sanitize" function defined for every auth provider and then call it generically
		if (parent.provider === AuthProvider.Local) {
			const { password, ...rest } = parent.data as any;
			data = rest;
		}

		return JSON.stringify(data);
	}
}

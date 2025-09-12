import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UserAuthDataDto } from '@/user/dto/graphql/auth-data.dto';
import { AdminAuthDataDto } from '@/admin/dto/graphql/auth-data.dto';
import { SessionTokensDto } from '@/session/dto/graphql/session-tokens.dto';

import { AdminAccess, PublicAccess } from '../access.decorator';
import { AuthStrategyDto } from '../dto/graphql/auth-strategy.dto';

import { LocalService } from './local.service';
import { AuthLocalUserUpdateDto } from './dto/request/user-update.dto';
import { AuthLocalAdminUpdateDto } from './dto/request/admin-update.dto';

@Resolver()
export class LocalResolver {
	constructor(private readonly localService: LocalService) {}

	@PublicAccess()
	@Query(() => [AuthStrategyDto])
	async authLocalStrategies(@Args('admin') admin: boolean) {
		return this.localService.findStrategies(admin);
	}

	@PublicAccess()
	@Mutation(() => SessionTokensDto)
	async authLocalLogin(
		@Context() ctx: any,
		@Args('strategy') strategy: string,
		@Args('email') email: string,
		@Args('password') password: string,
	) {
		return this.localService.login(ctx.req, strategy, email, password);
	}

	@AdminAccess()
	@Mutation(() => UserAuthDataDto)
	async authLocalUpdateUser(
		@Args('strategy') strategy: string,
		@Args('userId') userId: string,
		@Args('dto', { type: () => AuthLocalUserUpdateDto })
		dto: AuthLocalUserUpdateDto,
	) {
		return this.localService.updateUser(strategy, userId, dto);
	}

	@AdminAccess()
	@Mutation(() => AdminAuthDataDto)
	async authLocalUpdateAdmin(
		@Args('strategy') strategy: string,
		@Args('adminId') adminId: string,
		@Args('dto', { type: () => AuthLocalAdminUpdateDto })
		dto: AuthLocalAdminUpdateDto,
	) {
		return this.localService.updateAdmin(strategy, adminId, dto);
	}
}

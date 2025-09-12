import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { SessionTokensDto } from '@/session/dto/graphql/session-tokens.dto';

import { PublicAccess } from '../access.decorator';
import { AuthStrategyDto } from '../dto/graphql/auth-strategy.dto';

import { OpenIdService } from './open-id.service';

@Resolver()
export class OpenIdResolver {
	constructor(private readonly openIdService: OpenIdService) {}

	@PublicAccess()
	@Query(() => [AuthStrategyDto])
	async authOpenIdStrategies(@Args('admin') admin: boolean) {
		return this.openIdService.findStrategies(admin);
	}

	@PublicAccess()
	@Mutation(() => String)
	async authOpenIdLoginStart(
		@Context() ctx: any,
		@Args('strategy') strategy: string,
		@Args('redirectUrl') redirectUrl: string,
	) {
		return this.openIdService.loginStart(ctx.req, strategy, redirectUrl);
	}

	@PublicAccess()
	@Mutation(() => SessionTokensDto)
	async authOpenIdLoginRedeem(
		@Context() ctx: any,
		@Args('strategy') strategy: string,
		@Args('code') code: string,
	) {
		return this.openIdService.redeem(ctx.req, strategy, code);
	}
}

import { Throttle } from '@nestjs/throttler';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UnauthorizedException } from '@nestjs/common';

import { AdminService } from '@/admin/admin.service';
import { UserService } from '@/user/user.service';
import { SessionService } from '@/session/session.service';
import { SessionTokensDto } from '@/session/dto/graphql/session-tokens.dto';

import { PublicAccess } from './access.decorator';
import { AuthStrategyDto } from './dto/graphql/auth-strategy.dto';
import { OpenIdService } from './open-id/open-id.service';
import { LocalService } from './local/local.service';
import { AuthAppleService } from './apple/apple.service';
import { AuthGoogleService } from './google/google.service';

@Resolver()
export class AuthResolver {
	constructor(
		private readonly adminService: AdminService,
		private readonly userService: UserService,
		private readonly sessionService: SessionService,
		private readonly openIdService: OpenIdService,
		private readonly localService: LocalService,
		private readonly appleService: AuthAppleService,
		private readonly googleService: AuthGoogleService,
	) {}

	@PublicAccess()
	@Query(() => [AuthStrategyDto])
	async authStrategies(@Args('admin') admin: boolean) {
		return [
			...this.openIdService.findStrategies(admin),
			...this.localService.findStrategies(admin),
			...this.appleService.findStrategies(admin),
			...this.googleService.findStrategies(admin),
		];
	}

	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@Mutation(() => SessionTokensDto)
	async authRefreshTokens(
		@Args('refreshToken') token: string,
	): Promise<SessionTokensDto> {
		const refresh = await this.sessionService.verifyRefresh(token);
		if (!refresh) {
			throw new UnauthorizedException('invalid_refresh_token');
		}

		const { exp, iat, ...subject } = refresh;

		// Check if meanwhile the user/admin was blocked
		if (subject.isAdmin) {
			const admin = await this.adminService
				.findOne(subject.id)
				.catch(() => null);
			if (!admin) {
				throw new UnauthorizedException('not_authorized');
			}
			if (admin.deletedAt) {
				throw new UnauthorizedException('admin_blocked');
			}
		} else {
			const user = await this.userService.findOne(subject.id).catch(() => null);
			if (!user) {
				throw new UnauthorizedException('not_authorized');
			}
			if (user.deletedAt) {
				throw new UnauthorizedException('user_blocked');
			}
		}

		return this.sessionService.generateTokens(subject, { token, exp });
	}
}

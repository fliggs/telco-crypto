import {
	BadRequestException,
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Query,
	Req,
	SerializeOptions,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { SessionService } from '@/session/session.service';
import { PublicSessionTokensDto } from '@/session/dto/response/public-session-tokens.dto';
import { AdminService } from '@/admin/admin.service';
import { UserService } from '@/user/user.service';

import { AuthenticatedAccess, PublicAccess } from './access.decorator';
import { LocalService } from './local/local.service';
import { OpenIdService } from './open-id/open-id.service';
import { PublicAuthStrategyDto } from './dto/response/public-auth-strategy.dto';
import { RefreshDto } from './dto/request/refresh.dto';
import { AuthAppleService } from './apple/apple.service';
import { AuthGoogleService } from './google/google.service';

@Controller({
	path: 'auth',
	version: '1',
})
export class AuthController {
	constructor(
		private readonly openIdService: OpenIdService,
		private readonly localService: LocalService,
		private readonly appleService: AuthAppleService,
		private readonly googleService: AuthGoogleService,
		private readonly sessionService: SessionService,
		private readonly adminService: AdminService,
		private readonly userService: UserService,
	) {}

	@Get()
	@PublicAccess()
	@SerializeOptions({ type: PublicAuthStrategyDto })
	async findStrategies(
		@Query('admin') admin: boolean,
	): Promise<PublicAuthStrategyDto[]> {
		return [
			...this.openIdService.findStrategies(admin),
			...this.localService.findStrategies(admin),
			...this.appleService.findStrategies(admin),
			...this.googleService.findStrategies(admin),
		];
	}

	/*
	@Get('check')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@ApiOkResponse({ schema: { enum: Object.values(AuthProvider) } })
	@SerializeOptions({ type: String })
	async check(
		@Query('admin') admin: boolean,
		@Query('email') email: string,
	): Promise<AuthProvider[]> {
		if (admin) {
			return [];
		} else {
			const strategies =
				await this.userService.findAuthStrategiesByEmail(email);
			return strategies.map((p) => p.provider as AuthProvider);
		}
	}
	*/

	@Post('logout')
	@AuthenticatedAccess()
	@HttpCode(200)
	async logout(@Req() req: Request): Promise<void> {
		await new Promise<void>((resolve, reject) =>
			req.session.destroy((err) => (err ? reject(err) : resolve())),
		);
	}

	@Post('refresh')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@ApiBody({ type: RefreshDto, required: false })
	@ApiQuery({ name: 'refreshToken', type: 'string', required: false })
	@SerializeOptions({ type: PublicSessionTokensDto })
	async refresh(
		@Query('refreshToken') refreshToken?: string,
		@Body() dto?: RefreshDto,
	): Promise<PublicSessionTokensDto> {
		const token = refreshToken ?? dto?.refreshToken;
		if (!token) {
			throw new BadRequestException('invalid_refresh_token');
		}

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

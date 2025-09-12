import {
	Controller,
	Get,
	Req,
	SerializeOptions,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

import { PublicAccess } from '@/auth/access.decorator';
import { AdminService } from '@/admin/admin.service';
import { UserService } from '@/user/user.service';

import { SessionService } from './session.service';
import { PublicSessionTokensDto } from './dto/response/public-session-tokens.dto';

@Controller({
	path: 'sessions',
	version: '1',
})
export class SessionController {
	constructor(
		private readonly sessionService: SessionService,
		private readonly adminService: AdminService,
		private readonly userService: UserService,
	) {}

	@Get()
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicSessionTokensDto })
	async refreshSession(@Req() req: Request): Promise<PublicSessionTokensDto> {
		if (!req.token) {
			throw new UnauthorizedException('missing_token');
		}

		const refresh = await this.sessionService.verifyRefresh(req.token);
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

		return this.sessionService.generateTokens(subject);
	}
}

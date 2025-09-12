import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Put,
	Query,
	Req,
	SerializeOptions,
	UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

import { PublicSessionTokensDto } from '@/session/dto/response/public-session-tokens.dto';

import { PublicAccess, UserAccess } from '../access.decorator';
import { PublicAuthStrategyDto } from '../dto/response/public-auth-strategy.dto';

import { LocalService } from './local.service';
import { LoginDto } from './dto/request/login.dto';
import { SignupDto } from './dto/request/signup.dto';
import { VerifyDto } from './dto/request/verify.dto';
import { ResetPasswordDto } from './dto/request/reset-password.dto';
import { SetPasswordDto } from './dto/request/set-password.dto';
import { ResetVerifyDto } from './dto/request/reset-verify.dto';
import { ChangeUnverifiedEmailDto } from './dto/request/change-unverified-email.dto';

@Controller({
	path: '/auth/local',
	version: '1',
})
@ApiTags('Auth')
export class LocalController {
	constructor(private readonly localService: LocalService) {}

	@Get()
	@PublicAccess()
	@SerializeOptions({ type: PublicAuthStrategyDto })
	async findStrategies(
		@Query('admin') admin: boolean,
	): Promise<PublicAuthStrategyDto[]> {
		return this.localService.findStrategies(admin);
	}

	@Post(':strategy/login')
	@PublicAccess()
	@HttpCode(200)
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicSessionTokensDto })
	async login(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: LoginDto,
	): Promise<PublicSessionTokensDto> {
		return this.localService.login(req, strategy, dto.email, dto.password);
	}

	@Post(':strategy/signup')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	async signup(
		@Param('strategy') strategy: string,
		@Body() dto: SignupDto,
	): Promise<void> {
		return this.localService.signup(
			strategy,
			dto.email,
			dto.password,
			dto.firstName,
			dto.lastName,
		);
	}

	@Patch(':strategy/change-unverified-email')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	async changeEmail(
		@Param('strategy') strategy: string,
		@Body() dto: ChangeUnverifiedEmailDto,
	): Promise<void> {
		if (!dto.oldEmail || !dto.newEmail) {
			throw new UnauthorizedException('Invalid email change request');
		}

		return this.localService.changeUnverifiedEmail(
			strategy,
			dto.oldEmail,
			dto.newEmail,
		);
	}

	@Put(':strategy/reset')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	async resetPassword(
		@Param('strategy') strategy: string,
		@Body() dto: ResetPasswordDto,
	): Promise<void> {
		await this.localService.resetPassword(strategy, dto.email);
	}

	@Post(':strategy/reset')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@SerializeOptions({ type: PublicSessionTokensDto })
	async setPassword(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: SetPasswordDto,
	): Promise<PublicSessionTokensDto> {
		return this.localService.setPassword(
			req,
			strategy,
			dto.email,
			dto.code,
			dto.password,
		);
	}

	@Put(':strategy/verify')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	async resetVerify(
		@Param('strategy') strategy: string,
		@Body() dto: ResetVerifyDto,
	): Promise<void> {
		await this.localService.resetVerify(strategy, dto.email);
	}

	@Post(':strategy/verify')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@SerializeOptions({ type: PublicSessionTokensDto })
	async verify(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: VerifyDto,
	): Promise<PublicSessionTokensDto> {
		return this.localService.verify(req, strategy, dto.email, dto.code);
	}
}

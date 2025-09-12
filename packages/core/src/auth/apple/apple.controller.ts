import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpRedirectResponse,
	Param,
	Post,
	Query,
	Redirect,
	Req,
	SerializeOptions,
	Version,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

import { PublicSessionTokensDto } from '@/session/dto/response/public-session-tokens.dto';

import { PublicAccess } from '../access.decorator';
import { PublicAuthStrategyDto } from '../dto/response/public-auth-strategy.dto';

import { AuthAppleService } from './apple.service';
import { AuthAppleExchangeCallbackDto } from './dto/request/exchange-callback.dto';
import { PublicAuthAppleExchangeDto } from './dto/response/public-exchange.dto';
import { AuthAppleLoginRedeemDto } from './dto/request/login-redeem.dto';

@Controller({
	path: 'auth/apple',
	version: '1',
})
@ApiTags('Auth')
export class AuthAppleController {
	constructor(private readonly appleService: AuthAppleService) {}

	@Get()
	@PublicAccess()
	@SerializeOptions({ type: PublicAuthStrategyDto })
	async findStrategies(
		@Query('admin') admin: boolean,
	): Promise<PublicAuthStrategyDto[]> {
		return this.appleService.findStrategies(admin);
	}

	@Get(':strategy/login')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@Redirect()
	@ApiExcludeEndpoint()
	@SerializeOptions({ strategy: 'exposeAll' })
	async loginStart(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Query('redirect') redirect: string,
	): Promise<HttpRedirectResponse> {
		const url = await this.appleService.loginStart(req, strategy, redirect);
		return { url, statusCode: 302 };
	}

	@Post(':strategy/login')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicSessionTokensDto })
	async loginRedeem(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: AuthAppleLoginRedeemDto,
	): Promise<PublicSessionTokensDto> {
		return this.appleService.redeem(req, strategy, dto.code);
	}

	@Get(':strategy/callback')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@Redirect()
	@ApiExcludeEndpoint()
	@SerializeOptions({ strategy: 'exposeAll' })
	async loginCallbackGet(
		@Req() req: Request,
		@Param('strategy') strategy: string,
	): Promise<HttpRedirectResponse> {
		const url = await this.appleService.callback(req, strategy);
		return { url, statusCode: 302 };
	}

	@Post(':strategy/callback')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@Redirect()
	@ApiExcludeEndpoint()
	@SerializeOptions({ strategy: 'exposeAll' })
	async loginCallbackPost(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: any,
	): Promise<HttpRedirectResponse> {
		const url = await this.appleService.callback(req, strategy);
		return { url, statusCode: 302 };
	}

	@Get(':strategy/exchange')
	@Version('2')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicAuthAppleExchangeDto })
	async exchangeStartV2(
		@Req() req: Request,
		@Param('strategy') strategy: string,
	): Promise<PublicAuthAppleExchangeDto> {
		return this.appleService.exchangeStart(req, strategy);
	}

	@Post(':strategy/exchange')
	@Version('2')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@SerializeOptions({ type: PublicSessionTokensDto })
	async exchangeCallbackV2(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: AuthAppleExchangeCallbackDto,
	): Promise<PublicSessionTokensDto> {
		return this.appleService.exchangeCallback(req, strategy, dto.idToken);
	}

	// ----------------------------------------------------------------------
	// -- BELOW METHODS ARE DEPRECATED BUT KEPT FOR BACKWARDS COMPATIBILITY
	// ----------------------------------------------------------------------

	@Get(':strategy')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicAuthAppleExchangeDto })
	async setup(
		@Req() req: Request,
		@Param('strategy') strategy: string,
	): Promise<PublicAuthAppleExchangeDto> {
		return this.appleService.exchangeStart(req, strategy);
	}

	@Post(':strategy')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@SerializeOptions({ type: PublicSessionTokensDto })
	async exchange(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: AuthAppleExchangeCallbackDto,
	): Promise<PublicSessionTokensDto> {
		return this.appleService.exchangeCallback(
			req,
			strategy,
			dto.idToken,
			dto.firstName,
			dto.lastName,
		);
	}
}

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

import { AuthGoogleService } from './google.service';
import { PublicAuthGoogleExchangeDto } from './dto/response/public-exchange.dto';
import { AuthGoogleExchangeCallbackDto } from './dto/request/exchange-callback.dto';
import { AuthGoogleLoginRedeemDto } from './dto/request/login-redeem.dto';

@Controller({
	path: 'auth/google',
	version: '1',
})
@ApiTags('Auth')
export class AuthGoogleController {
	constructor(private readonly googleService: AuthGoogleService) {}

	@Get()
	@PublicAccess()
	@SerializeOptions({ type: PublicAuthStrategyDto })
	async findStrategies(
		@Query('admin') admin: boolean,
	): Promise<PublicAuthStrategyDto[]> {
		return this.googleService.findStrategies(admin);
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
		const url = await this.googleService.loginStart(req, strategy, redirect);
		return { url, statusCode: 302 };
	}

	@Post(':strategy/login')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicSessionTokensDto })
	async loginRedeem(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: AuthGoogleLoginRedeemDto,
	): Promise<PublicSessionTokensDto> {
		return this.googleService.redeem(req, strategy, dto.code);
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
		const url = await this.googleService.callback(req, strategy);
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
		const url = await this.googleService.callback(req, strategy);
		return { url, statusCode: 302 };
	}

	@Get(':strategy/exchange')
	@Version('2')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicAuthGoogleExchangeDto })
	async exchangeStartV2(
		@Req() req: Request,
		@Param('strategy') strategy: string,
	): Promise<PublicAuthGoogleExchangeDto> {
		return this.googleService.exchangeStart(req, strategy);
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
		@Body() dto: AuthGoogleExchangeCallbackDto,
	): Promise<PublicSessionTokensDto> {
		return this.googleService.exchangeCallback(req, strategy, dto.idToken);
	}

	// ----------------------------------------------------------------------
	// -- BELOW METHODS ARE DEPRECATED BUT KEPT FOR BACKWARDS COMPATIBILITY
	// ----------------------------------------------------------------------

	@Get(':strategy')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicAuthGoogleExchangeDto })
	async exchangeStart(
		@Req() req: Request,
		@Param('strategy') strategy: string,
	): Promise<PublicAuthGoogleExchangeDto> {
		return this.googleService.exchangeStart(req, strategy);
	}

	@Post(':strategy')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@SerializeOptions({ type: PublicSessionTokensDto })
	async exchangeCallback(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: AuthGoogleExchangeCallbackDto,
	): Promise<PublicSessionTokensDto> {
		return this.googleService.exchangeCallback(req, strategy, dto.idToken);
	}
}

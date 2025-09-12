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
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';

import { PublicSessionTokensDto } from '@/session/dto/response/public-session-tokens.dto';

import { PublicAccess } from '../access.decorator';
import { PublicAuthStrategyDto } from '../dto/response/public-auth-strategy.dto';

import { OpenIdService } from './open-id.service';
import { AuthOpenIdExchangeCallbackDto } from './dto/request/exchange-callback.dto';
import { PublicExchangeDto } from './dto/response/public-exchange.dto';
import { AuthOpenIdLoginRedeemDto } from './dto/request/login-redeem.dto';

@Controller({
	path: 'auth/open-id',
	version: '1',
})
@ApiTags('Auth')
export class OpenIdController {
	constructor(private readonly openIdService: OpenIdService) {}

	@Get()
	@PublicAccess()
	@SerializeOptions({ type: PublicAuthStrategyDto })
	async findStrategies(
		@Query('admin') admin: boolean,
	): Promise<PublicAuthStrategyDto[]> {
		return this.openIdService.findStrategies(admin);
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
		const url = await this.openIdService.loginStart(req, strategy, redirect);
		return { url, statusCode: 302 };
	}

	@Post(':strategy/login')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicSessionTokensDto })
	async loginRedeem(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: AuthOpenIdLoginRedeemDto,
	): Promise<PublicSessionTokensDto> {
		return this.openIdService.redeem(req, strategy, dto.code);
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
		const url = await this.openIdService.callback(req, strategy);
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
		const url = await this.openIdService.callback(req, strategy);
		return { url, statusCode: 302 };
	}

	@Get(':strategy/exchange')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@SerializeOptions({ type: PublicExchangeDto })
	async exchangeStart(
		@Req() req: Request,
		@Param('strategy') strategy: string,
	): Promise<PublicExchangeDto> {
		return this.openIdService.exchangeStart(req, strategy);
	}

	@Post(':strategy/exchange')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@HttpCode(200)
	@SerializeOptions({ type: PublicSessionTokensDto })
	async exchangeCallback(
		@Req() req: Request,
		@Param('strategy') strategy: string,
		@Body() dto: AuthOpenIdExchangeCallbackDto,
	): Promise<PublicSessionTokensDto> {
		return this.openIdService.exchangeCallback(req, strategy, dto.idToken);
	}
}

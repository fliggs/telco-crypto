import {
	BadRequestException,
	Injectable,
	Logger,
	OnModuleInit,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload, sign } from 'jsonwebtoken';
import { add } from 'date-fns';
import type Client from 'openid-client';

import { SessionTokens } from '@/session/dto/internal/session-tokens.dto';

import { OpenIdService } from '../open-id/open-id.service';
import { OpenIdStrategy } from '../open-id/dto/internal/strategy.dto';
import { AuthProvider } from '../dto/internal/auth-strategy.dto';

import { AuthAppleConfig } from './dto/internal/config.dto';
import { AppleStrategy } from './dto/internal/strategy.dto';

const ISS = 'https://appleid.apple.com';

@Injectable()
export class AuthAppleService extends OpenIdService implements OnModuleInit {
	protected readonly logger = new Logger(AuthAppleService.name);
	protected readonly name = AuthProvider.Apple;
	protected readonly strategies: Map<string, AppleStrategy> = new Map();

	async onModuleInit() {
		await super.onModuleInit(true);

		const auth = this.config.getOrThrow<AuthAppleConfig>(`auth.${this.name}`);
		if (auth) {
			for (const [name, conf] of Object.entries(auth)) {
				const url = new URL(ISS);
				const secretKey = conf.clientSecretEnv
					? this.config.getOrThrow(conf.clientSecretEnv)
					: undefined;

				const clientSecret = sign(
					{
						exp: Math.floor(add(new Date(), { months: 5 }).getTime() / 1000), // apple allows max 6 months in the future
						iat: Math.floor(new Date().getTime() / 1000),
						iss: conf.teamId,
						aud: 'https://appleid.apple.com',
						sub: conf.clientId,
					},
					secretKey,
					{
						algorithm: 'ES256',
						header: {
							alg: 'ES256',
							kid: conf.keyId,
						},
					},
				);

				const clientConfig = await this.client.discovery(
					url,
					conf.clientId,
					clientSecret,
				);

				this.strategies.set(name, {
					name,
					config: clientConfig,
					admin: conf.admin,
					title: conf.title,
					allowedIssuer: [ISS],
					scope: 'email name openid',
					clientId: conf.clientId,
					allowedHost: conf.allowedHost,
					allowedAudience: conf.allowedAudience,
					redirectUrls: new Set(conf.redirectUrls),
					tags: conf.tags,
				});
			}
		}
	}

	protected override async addParameters(
		params: Record<string, string>,
	): Promise<Record<string, string>> {
		return {
			...params,
			response_mode: 'form_post',
		};
	}

	protected override async getProfile(
		req: Request,
		strategy: OpenIdStrategy,
		accessToken: string,
		sub: string,
	): Promise<JwtPayload | Client.UserInfoResponse> {
		if (req.body) {
			return { sub, ...req.body.user };
		}
		return { sub };
	}

	override async exchangeCallback(
		req: Request,
		strategy: string,
		idToken: string,
		firstName?: string,
		lastName?: string,
	): Promise<SessionTokens> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		const profile = await this.verifyProfile(strat, idToken);
		const loggedInSubject = await this.sync(
			this.name,
			strat,
			profile,
			(p) => p.email,
			() => firstName ?? '',
			() => lastName ?? '',
		);

		this.sessionService.store(req, this.name, strategy, {
			user: loggedInSubject,
		});
		req.user = loggedInSubject;

		return this.sessionService.generateTokens(req.user);
	}
}

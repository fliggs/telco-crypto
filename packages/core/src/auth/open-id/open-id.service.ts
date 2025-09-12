import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	Logger,
	OnModuleInit,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Client from 'openid-client';
import { Request } from 'express';
import { Admin, User, UserGroup, UserSettings } from '@prisma/client';
import { JwtPayload, verify } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

import { DbService } from '@/db/db.service';
import { UserService } from '@/user/user.service';
import { UserGroupService } from '@/user/group.service';
import { AdminService } from '@/admin/admin.service';
import { EventsService } from '@/events/events.service';
import { SessionService } from '@/session/session.service';
import { SessionTokens } from '@/session/dto/internal/session-tokens.dto';
import { USER_EVENT_CREATED, USER_EVENT_VERIFIED } from '@/user/user.events';

import { LoggedInSubject } from '../logged-in.decorator';
import {
	AuthProvider,
	AuthStrategyDto,
} from '../dto/internal/auth-strategy.dto';

import { AuthOpenIdConfig } from './dto/internal/config.dto';
import { PublicExchangeDto } from './dto/response/public-exchange.dto';
import { OpenIdSessionDto } from './dto/internal/session.dto';
import { OpenIdStrategy } from './dto/internal/strategy.dto';

@Injectable()
export class OpenIdService implements OnModuleInit {
	protected readonly logger = new Logger(OpenIdService.name);
	protected readonly name: AuthProvider = AuthProvider.OpenId;
	protected readonly strategies: Map<string, OpenIdStrategy> = new Map();
	protected readonly redeemCodes: Map<string, SessionTokens> = new Map();
	protected client: typeof Client;

	constructor(
		protected readonly config: ConfigService,
		protected readonly db: DbService,
		protected readonly userService: UserService,
		protected readonly groupService: UserGroupService,
		protected readonly adminService: AdminService,
		protected readonly sessionService: SessionService,
		protected readonly eventsService: EventsService,
	) {}

	async onModuleInit(skipConfig: boolean = false) {
		// The eval statement stops the typescript compiler from converting this dynamic import
		// into a "require" call, which wouldn't work with the esm-only module "openid-client"
		this.client = await eval(`import('openid-client')`);

		if (!skipConfig) {
			const auth = this.config.get<AuthOpenIdConfig>(`auth.${this.name}`);
			if (auth) {
				for (const [name, conf] of Object.entries(auth)) {
					const url = new URL(conf.issuerUrl);
					const clientSecret = conf.clientSecretEnv
						? this.config.getOrThrow(conf.clientSecretEnv)
						: undefined;
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
						scope: conf.scope,
						clientId: conf.clientId,
						redirectUrls: new Set(conf.redirectUrls),
						allowedHost: conf.allowedHost,
						allowedAudience: conf.allowedAudience,
						allowedIssuer: conf.allowedIssuer,
						tags: conf.tags,
					});
				}
			}
		}
	}

	findStrategies(admin: boolean): AuthStrategyDto[] {
		return [...this.strategies]
			.filter(([, cfg]) => cfg.admin === admin)
			.map(([name, cfg]) => ({
				provider: this.name,
				name,
				title: cfg.title,
				tags: cfg.tags,
			}));
	}

	async loginStart(
		req: Request,
		strategy: string,
		redirectUrl: string,
	): Promise<string> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		if (!strat.redirectUrls.has(redirectUrl)) {
			this.logger.warn(`Invalid redirect url: ${redirectUrl}`);
			throw new BadRequestException('invalid_redirect_url');
		}

		const codeVerifier = this.client.randomPKCECodeVerifier();
		const codeChallenge =
			await this.client.calculatePKCECodeChallenge(codeVerifier);

		const protocol = req.protocol;
		const host = req.headers.host ?? strat.allowedHost[0];
		const callbackUrl = `${protocol}://${host}/v1/auth/${this.name}/${strat.name}/callback`;

		const parameters: Record<string, string> = {
			redirect_uri: callbackUrl,
			scope: strat.scope,
			code_challenge: codeChallenge,
			code_challenge_method: 'S256',
		};

		let state: string | undefined = undefined;
		state = this.client.randomState();
		parameters.state = state;

		const params = await this.addParameters(parameters);
		const url: URL = this.client.buildAuthorizationUrl(strat.config, params);

		this.sessionService.store<OpenIdSessionDto>(req, this.name, strategy, {
			callbackUrl,
			redirectUrl,
			user: undefined,
			codeVerifier,
			state,
		});
		return url.toString();
	}

	protected async addParameters(
		params: Record<string, string>,
	): Promise<Record<string, string>> {
		return params;
	}

	async callback(req: Request, strategy: string): Promise<string> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		const data = this.sessionService.retrieve<OpenIdSessionDto>(
			req,
			this.name,
			strategy,
		);

		if (!data?.callbackUrl) {
			throw new BadRequestException('missing_callback_url');
		}

		const url = new URL(data.callbackUrl);
		for (const [key, value] of Object.entries(req.query)) {
			if (typeof value === 'string') {
				url.searchParams.set(key, value);
			}
		}
		if (req.body && typeof req.body === 'object') {
			for (const [key, value] of Object.entries(req.body)) {
				if (typeof value === 'string') {
					url.searchParams.set(key, value);
				}
			}
		}

		const res = await this.client.authorizationCodeGrant(strat.config, url, {
			pkceCodeVerifier: data?.codeVerifier,
			expectedState: data?.state,
		});

		const idToken = res.id_token;
		if (!idToken) {
			throw new InternalServerErrorException('missing_id_token');
		}

		const claims = res.claims();
		if (!claims) {
			throw new InternalServerErrorException('could_not_parse_claims');
		}

		const profile = await this.getProfile(
			req,
			strat,
			res.access_token,
			claims.sub,
		);

		const loggedInSubject = await this.sync(this.name, strat, profile);
		req.user = loggedInSubject;

		const tokens = await this.sessionService.generateTokens(loggedInSubject);

		this.sessionService.store<OpenIdSessionDto>(req, this.name, strategy, {
			user: loggedInSubject,
		});

		const redeemCode = this.sessionService.generateCode();
		this.redeemCodes.set(`${strategy}-${redeemCode}`, tokens);

		const newUrl = new URL(data.redirectUrl);
		newUrl.searchParams.set('provider', this.name);
		newUrl.searchParams.set('strategy', strat.name);
		newUrl.searchParams.set('code', redeemCode);
		return newUrl.toString();
	}

	protected async getProfile(
		req: Request,
		strategy: OpenIdStrategy,
		accessToken: string,
		sub: string,
	): Promise<JwtPayload | Client.UserInfoResponse> {
		return this.client.fetchUserInfo(strategy.config, accessToken, sub);
	}

	async redeem(req: Request, strategy: string, code: string) {
		const tokens = this.redeemCodes.get(`${strategy}-${code}`);
		if (!tokens) {
			throw new BadRequestException('invalid_code');
		}
		return tokens;
	}

	async exchangeStart(
		req: Request,
		strategy: string,
	): Promise<PublicExchangeDto> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		const serverMeta = strat.config.serverMetadata();
		const clientMeta = strat.config.clientMetadata();
		const redirectUrl = [...strat.redirectUrls.values()][0];

		return {
			issuerUrl: serverMeta.issuer,
			clientId: clientMeta.client_id,
			redirectUrl: redirectUrl,
			scope: strat.scope,
		};
	}

	async exchangeCallback(
		req: Request,
		strategy: string,
		idToken: string,
	): Promise<SessionTokens> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		const profile = await this.verifyProfile(strat, idToken);
		const loggedInSubject = await this.sync(this.name, strat, profile);

		this.sessionService.store(req, this.name, strategy, {
			user: loggedInSubject,
		});
		req.user = loggedInSubject;

		return this.sessionService.generateTokens(req.user);
	}

	protected async verifyProfile(strat: OpenIdStrategy, token: string) {
		const meta = strat.config.serverMetadata();
		if (!meta.jwks_uri) {
			throw new BadRequestException('missing_jwks_uri');
		}

		const jwksClient = new JwksClient({ jwksUri: meta.jwks_uri });
		const profile = await new Promise<string | JwtPayload | undefined>(
			(res, rej) =>
				verify(
					token,
					(header, cb) => {
						jwksClient.getSigningKey(header.kid, (err, key) =>
							cb(err, key?.getPublicKey()),
						);
					},
					{
						audience: strat.allowedAudience as any, // TODO: These typings are wrong
						issuer: strat.allowedIssuer as any, // TODO: These typings are wrong
					},
					(err, decoded) => (err ? rej(err) : res(decoded)),
				),
		);
		if (!profile || typeof profile === 'string') {
			throw new BadRequestException(`invalid_token:${profile}`);
		}

		return profile;
	}

	protected async sync(
		provider: AuthProvider = this.name,
		strategy: OpenIdStrategy,
		profile: JwtPayload | Client.UserInfoResponse,
		getEmail: (profile: JwtPayload | Client.UserInfoResponse) => string = (
			profile,
		) => profile.email,
		getFirstName: (profile: JwtPayload | Client.UserInfoResponse) => string = (
			profile,
		) => profile.given_name ?? '',
		getLastName: (profile: JwtPayload | Client.UserInfoResponse) => string = (
			profile,
		) => profile.family_name ?? '',
	) {
		const firstName = getFirstName(profile);
		const lastName = getLastName(profile);

		let isNew = false;
		let subject:
			| (User & { group: UserGroup | null; settings: UserSettings | null })
			| Admin;

		if (strategy.admin) {
			let authData = await this.db.adminAuthData.findFirst({
				where: {
					provider,
					strategy: strategy.name,
					data: {
						path: ['sub'],
						equals: profile.sub,
					},
				},
				include: {
					admin: true,
				},
			});

			if (!authData) {
				const email = getEmail(profile);
				if (!email) {
					throw new InternalServerErrorException('profile_contains_no_email');
				}

				const existing = await this.adminService.findByEmail(email);
				if (existing) {
					throw new BadRequestException('email_in_use');
				}

				authData = await this.db.adminAuthData.create({
					data: {
						provider: this.name,
						strategy: strategy.name,
						data: profile,
						admin: {
							create: {
								email: email,
								firstName: firstName,
								lastName: lastName,
							},
						},
					},
					include: {
						admin: true,
					},
				});
				isNew = true;
			} else if (authData.admin.deletedAt) {
				throw new UnauthorizedException('admin_blocked');
			}
			subject = authData.admin;
		} else {
			let authData = await this.db.userAuthData.findFirst({
				where: {
					provider,
					strategy: strategy.name,
					data: {
						path: ['sub'],
						equals: profile.sub,
					},
				},
				include: {
					user: {
						include: {
							settings: true,
							group: true,
						},
					},
				},
			});

			if (!authData) {
				const email = getEmail(profile);
				if (!email) {
					throw new InternalServerErrorException('profile_contains_no_email');
				}

				const existing = await this.userService
					.findByEmailWithGroupAndSettings(email)
					.catch(() => null);
				if (existing) {
					throw new BadRequestException('email_in_use');
				}

				authData = await this.db.userAuthData.create({
					data: {
						provider,
						strategy: strategy.name,
						data: profile,
						user: {
							create: {
								email: email,
								firstName: firstName,
								lastName: lastName,
								settings: {},
							},
						},
					},
					include: {
						user: {
							include: {
								settings: true,
								group: true,
							},
						},
					},
				});
				isNew = true;
			} else if (authData.user.deletedAt) {
				throw new UnauthorizedException('user_blocked');
			}

			// Add default group if not set
			if (!authData.user.group) {
				authData.user.group = this.groupService.getDefaultGroup();
				authData.user.groupId = authData.user.group.id;
			}

			subject = authData.user;
		}

		const loggedInSubject: LoggedInSubject = {
			provider,
			strategy: strategy.name,
			isAdmin: strategy.admin,
			settings: 'settings' in subject ? subject.settings : null,
			groupId: 'groupId' in subject ? subject.groupId : null,
			group: 'group' in subject ? subject.group : null,
			...subject,
		};

		if (isNew && !strategy.admin) {
			this.eventsService.emit(USER_EVENT_CREATED, loggedInSubject);
			this.eventsService.emit(USER_EVENT_VERIFIED, loggedInSubject);
		}

		return loggedInSubject;
	}
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { add, isBefore } from 'date-fns';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';

import { LoggedInSubject } from '@/auth/logged-in.decorator';
import { AuthProvider } from '@/auth/dto/internal/auth-strategy.dto';

import { SessionDto } from './dto/internal/session.dto';
import { SessionTokens } from './dto/internal/session-tokens.dto';

const SESSION_EXPIRY = 1 * 60 * 60; // in seconds
const REFRESH_EXPIRY = 30 * 24 * 60 * 60; // in seconds

@Injectable()
export class SessionService implements OnModuleInit {
	private secret: string;
	private refreshSecret: string;

	constructor(
		private readonly config: ConfigService,
		private readonly jwtService: JwtService,
	) {}

	onModuleInit() {
		this.secret = this.config.getOrThrow('JWT_SECRET');
		this.refreshSecret = this.config.getOrThrow('JWT_REFRESH_SECRET');
	}

	findSessionUsers(req: Request) {
		const users: LoggedInSubject[] = [];
		const providers = req.session.auth;
		if (providers) {
			for (const provider of Object.keys(providers)) {
				const strategies = providers[provider];
				if (strategies) {
					for (const strategy of Object.keys(strategies)) {
						users.push(...strategies[strategy].users);
					}
				}
			}
		}
		return users;
	}

	store<T extends SessionDto = SessionDto>(
		req: Request,
		provider: AuthProvider,
		strategy: string,
		data: Partial<T>,
	) {
		// TODO: Save this data in a local cache if we have no session
		if (!req.session.auth) {
			req.session.auth = {};
		}
		if (!req.session.auth[provider]) {
			req.session.auth[provider] = {};
		}
		req.session.auth[provider][strategy] = {
			...req.session.auth[provider][strategy],
			...data,
		};
	}

	retrieve<T extends SessionDto = SessionDto>(
		req: Request,
		provider: AuthProvider,
		strategy: string,
	): T | undefined {
		// TODO: Get this data from a local cache if we have no session
		return req.session.auth?.[provider]?.[strategy] as T | undefined;
	}

	async verify(token: string) {
		return this.jwtService.verifyAsync(token, { secret: this.secret });
	}

	async verifyRefresh(token: string) {
		return this.jwtService.verifyAsync(token, { secret: this.refreshSecret });
	}

	async generateTokens(
		subject: LoggedInSubject,
		refresh?: { token: string; exp: number },
	): Promise<SessionTokens> {
		const token = await this.jwtService.signAsync(subject, {
			expiresIn: `${SESSION_EXPIRY}s`,
			secret: this.secret,
		});

		let refreshToken: string = '';
		let refreshExpires: string = '';
		if (refresh) {
			const oldRefreshExpires = new Date(refresh.exp * 1000);
			if (
				isBefore(
					add(new Date(), { seconds: SESSION_EXPIRY }),
					oldRefreshExpires,
				)
			) {
				refreshToken = refresh.token;
				refreshExpires = oldRefreshExpires.toISOString();
			}
		}

		if (!refreshToken) {
			refreshToken = await this.jwtService.signAsync(subject, {
				expiresIn: `${REFRESH_EXPIRY}s`,
				secret: this.refreshSecret,
			});
			refreshExpires = add(new Date(), {
				seconds: REFRESH_EXPIRY,
			}).toISOString();
		}

		return {
			token,
			expires: add(new Date(), { seconds: SESSION_EXPIRY }).toISOString(),
			refreshToken,
			refreshExpires,
		};
	}

	generateCode() {
		return randomBytes(64).toString('base64url');
	}
}

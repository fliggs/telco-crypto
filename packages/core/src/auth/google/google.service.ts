import {
	BadRequestException,
	Injectable,
	Logger,
	OnModuleInit,
} from '@nestjs/common';
import { Request } from 'express';

import { OpenIdService } from '../open-id/open-id.service';
import { AuthProvider } from '../dto/internal/auth-strategy.dto';

import { AuthGoogleConfig } from './dto/internal/config.dto';
import { PublicAuthGoogleExchangeDto } from './dto/response/public-exchange.dto';
import { GoogleStrategy } from './dto/internal/strategy.dto';

const ISS = 'https://accounts.google.com';

@Injectable()
export class AuthGoogleService extends OpenIdService implements OnModuleInit {
	protected readonly logger = new Logger(AuthGoogleService.name);
	protected readonly name = AuthProvider.Google;
	protected readonly strategies: Map<string, GoogleStrategy> = new Map();

	async onModuleInit() {
		await super.onModuleInit(true);

		const auth = this.config.getOrThrow<AuthGoogleConfig>(`auth.${this.name}`);
		if (auth) {
			for (const [name, conf] of Object.entries(auth)) {
				const url = new URL(ISS);
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
					allowedIssuer: [ISS],
					scope:
						'email profile openid https://www.googleapis.com/auth/drive.appdata',
					clientId: conf.clientId,
					iOSClientId: conf.iOSClientId,
					redirectUrls: new Set(conf.redirectUrls),
					allowedHost: conf.allowedHost,
					allowedAudience: conf.allowedAudience,
					tags: conf.tags,
				});
			}
		}
	}

	async exchangeStart(
		req: Request,
		strategy: string,
	): Promise<PublicAuthGoogleExchangeDto> {
		const strat = this.strategies.get(strategy);
		if (!strat) {
			throw new BadRequestException('invalid_strategy');
		}

		const basic = await super.exchangeStart(req, strategy);

		return {
			...basic,
			iOSClientId: strat.iOSClientId,
			webClientId: strat.clientId,
		};
	}
}

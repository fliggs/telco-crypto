import { OpenIdConfig } from '@/auth/open-id/dto/internal/config.dto';

export interface AuthAppleConfig {
	[name: string]: AppleConfig;
}

export interface AppleConfig extends OpenIdConfig {
	keyId: string;
	teamId: string;
}

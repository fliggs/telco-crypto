import { OpenIdConfig } from '@/auth/open-id/dto/internal/config.dto';

export interface AuthGoogleConfig {
	[name: string]: GoogleConfig;
}

export interface GoogleConfig extends OpenIdConfig {
	iOSClientId: string;
}

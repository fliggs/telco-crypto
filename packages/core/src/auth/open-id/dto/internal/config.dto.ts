export interface AuthOpenIdConfig {
	[name: string]: OpenIdConfig;
}

export interface OpenIdConfig {
	admin: boolean;
	title: string;
	scope: string;
	issuerUrl: string;
	redirectUrls: string[];
	clientId: string;
	clientSecretEnv: string;
	allowedHost: string[];
	allowedAudience: string[];
	allowedIssuer: string[];
	tags: string[];
}

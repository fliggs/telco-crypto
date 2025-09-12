import { Configuration } from 'openid-client';

export interface OpenIdStrategy {
	name: string;
	config: Configuration;
	admin: boolean;
	title: string;
	scope: string;
	clientId: string;
	allowedHost: string[];
	allowedAudience: string[];
	allowedIssuer: string[];
	redirectUrls: Set<string>;
	tags: string[];
}

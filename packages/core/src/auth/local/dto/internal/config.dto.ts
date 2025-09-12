import { AuthProvider } from '@/auth/dto/internal/auth-strategy.dto';

export interface AuthLocalConfig {
	[AuthProvider.Local]: {
		[name: string]: LocalConfig;
	};
}

export interface LocalConfig {
	admin: boolean;
	title: string;
	tags: string[];
}

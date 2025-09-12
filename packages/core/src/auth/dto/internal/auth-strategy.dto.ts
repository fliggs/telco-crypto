export enum AuthProvider {
	Local = 'local',
	Google = 'google',
	Apple = 'apple',
	OpenId = 'open-id',
}

export interface AuthStrategyDto {
	provider: AuthProvider;
	name: string;
	title: string;
	tags: string[];
}

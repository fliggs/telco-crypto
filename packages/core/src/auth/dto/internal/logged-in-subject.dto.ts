import { Admin, User, UserGroup, UserSettings } from '@prisma/client';

import { AuthProvider } from './auth-strategy.dto';

export interface LoggedInSubject extends User, Admin {
	provider: AuthProvider;
	strategy: string;
	isAdmin: boolean;
	settings: UserSettings | null;
	group: UserGroup | null;
}

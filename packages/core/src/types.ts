import { LoggedInSubject } from './auth/logged-in.decorator';
import { Content } from './content/dto/internal/content.dto';
import { AnyOnboardingData } from './onboarding/dto/response/onboarding-data.dto';
import { OrderPortInDataDto } from './order/dto/internal/port-in-data.dto';
import { OrderSimSelectionDataDto } from './order/dto/internal/sim-selection-data.dto';
import { UserSettingsDto } from './user/dto/internal/user-settings.dto';

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace PrismaJson {
		type ContentData = Content;
		type OnboardingData = AnyOnboardingData;
		type OrderPortInData = OrderPortInDataDto;
		type OrderSimSelectionData = OrderSimSelectionDataDto;
		type UserSettingsData = UserSettingsDto;
	}
}

declare module 'express' {
	interface Request {
		token: string | null;
		user: LoggedInSubject | null;
	}
}

declare module 'express-session' {
	interface SessionData {
		auth: {
			[provider: string]: {
				[strategy: string]: {
					users: LoggedInSubject[];
					[property: string]: any;
				};
			};
		};
	}
}

export {};

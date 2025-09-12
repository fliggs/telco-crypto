import { LoggedInSubject } from '@/auth/logged-in.decorator';

export interface SessionDto {
	user: LoggedInSubject;
}

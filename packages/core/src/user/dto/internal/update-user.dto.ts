import { UserSettingsDto } from './user-settings.dto';

export interface UpdateUserDto {
	email?: string;
	firstName?: string;
	lastName?: string;
	settings?: UserSettingsDto;
	groupId?: string | null;
}

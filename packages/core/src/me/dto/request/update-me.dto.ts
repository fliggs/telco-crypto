import { UpdateUserSettingsDto } from '@/user/dto/request/update-user-settings.dto';
import { Type } from 'class-transformer';
import {
	IsInstance,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';

export class UpdateMeDto {
	@IsString()
	@IsOptional()
	firstName?: string;

	@IsString()
	@IsOptional()
	lastName?: string;

	@ValidateNested()
	@IsInstance(UpdateUserSettingsDto)
	@IsOptional()
	@Type(() => UpdateUserSettingsDto)
	settings?: UpdateUserSettingsDto;
}

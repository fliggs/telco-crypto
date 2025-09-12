import { Expose } from 'class-transformer';

import { PublicUserDto } from '@/user/dto/response/public-user.dto';

export class PublicMeDto extends PublicUserDto {
	@Expose()
	provider: string;

	@Expose()
	strategy: string;
}

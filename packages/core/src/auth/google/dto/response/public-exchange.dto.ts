import { Expose } from 'class-transformer';

import { PublicExchangeDto } from '@/auth/open-id/dto/response/public-exchange.dto';

export class PublicAuthGoogleExchangeDto extends PublicExchangeDto {
	@Expose()
	webClientId: string;

	@Expose()
	iOSClientId: string;
}

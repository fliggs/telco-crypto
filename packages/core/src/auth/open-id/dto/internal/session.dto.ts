import { SessionDto } from '@/session/dto/internal/session.dto';

export interface OpenIdSessionDto extends SessionDto {
	callbackUrl: string;
	redirectUrl: string;
	codeVerifier?: string;
	state?: string;
}

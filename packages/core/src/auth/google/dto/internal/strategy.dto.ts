import { OpenIdStrategy } from '@/auth/open-id/dto/internal/strategy.dto';

export interface GoogleStrategy extends OpenIdStrategy {
	iOSClientId: string;
}

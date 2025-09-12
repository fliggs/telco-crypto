export interface AuthLocalUserDataDto {
	password?: string;
	verifiedAt?: string | null;
	verifyCode?: string | null;
	verifyCodeExpiresAt?: string | null;
	resetCode?: string | null;
	resetCodeExpiresAt?: string | null;
}

export interface CreateChangePhoneNumberDto {
	subId: string;
	msisdn?: string | null;
	isPortingIn?: boolean | null;
	ospAccountNumber?: string | null;
	ospPassword?: string | null;
	ospPostalCode?: string | null;
}

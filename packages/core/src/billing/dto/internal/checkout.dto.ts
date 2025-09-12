import { User } from '@prisma/client';

export interface CheckoutDto {
	user: User;
	protocol: string;
	host: string;
	url: string;
	method: string;
	query: Record<string, string>;
	body?: any;
}

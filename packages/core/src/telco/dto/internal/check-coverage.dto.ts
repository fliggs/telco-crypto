import { User } from '@prisma/client';

export interface CheckCoverageDto {
	user: User;
	line1: string;
	line2: string;
	line3: string;
	line4: string;
	city: string;
	postalCode: string;
	province: string;
	country: string;
}

export interface CheckCoverageResponseDto {
	/** The quality of the coverage in the interval [0, 1], or null. 0 = worst, 1 = best, null = unknown */
	coverage: number | null;
}

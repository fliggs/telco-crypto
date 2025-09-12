import { Decimal, DecimalNumber } from '@/decimal.dto';
import { Expose } from 'class-transformer';

export class PublicCountryDto {
	@Expose()
	name: string;

	@Expose()
	favourite: boolean;

	@Expose()
	roaming: boolean;

	@Decimal(true)
	rate: DecimalNumber | null;
}

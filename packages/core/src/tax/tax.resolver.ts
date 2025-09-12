import { Args, Query, Resolver } from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';
import { CheckAddressDto } from '@/address/dto/request/check-address.dto';

import { TaxService } from './tax.service';

@Resolver()
export class TaxResolver {
	constructor(private readonly taxService: TaxService) {}

	@AdminAccess()
	@Query(() => Boolean)
	async checkTaxAddress(
		@Args('address', { type: () => CheckAddressDto })
		dto: CheckAddressDto,
	): Promise<boolean> {
		await this.taxService.checkAddress(dto);
		return true;
	}
}

import { Args, Query, Resolver } from '@nestjs/graphql';

import { AdminAccess } from '@/auth/access.decorator';
import { CheckAddressDto } from '@/address/dto/request/check-address.dto';

import { TelcoService } from './telco.service';

@Resolver()
export class TelcoResolver {
	constructor(private readonly telcoService: TelcoService) {}

	@AdminAccess()
	@Query(() => Boolean)
	async checkTelcoAddress(
		@Args('address', { type: () => CheckAddressDto })
		dto: CheckAddressDto,
	): Promise<boolean> {
		await this.telcoService.checkAddress(dto);
		return true;
	}
}

import { Controller, Get, Param, SerializeOptions } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { PublicAccess } from '@/auth/access.decorator';

import { PromoCodeService } from './promo-code.service';
import { PublicPromoCodeWithOffersDto } from './dto/response/public-promo-code+offers.dto';

@Controller({
	path: 'promo-codes',
	version: '1',
})
export class PromoCodeController {
	constructor(private readonly promoCodeService: PromoCodeService) {}

	@Get('by-code/:code')
	@PublicAccess()
	@Throttle({ default: { ttl: 60000, limit: 6 } })
	@SerializeOptions({ type: PublicPromoCodeWithOffersDto })
	async findByCode(
		@Param('code') code: string,
	): Promise<PublicPromoCodeWithOffersDto> {
		return this.promoCodeService.findOneByCode(code);
	}
}

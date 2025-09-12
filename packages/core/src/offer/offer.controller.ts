import { Controller, Get, SerializeOptions } from '@nestjs/common';

import { PublicAccess } from '@/auth/access.decorator';

import { OfferService } from './offer.service';
import { PublicOfferWithPlanWithVolumesDto } from './dto/response/public-offer+plan+volumes.dto';

@Controller({
	path: 'offer',
	version: '1',
})
export class OfferController {
	constructor(private readonly offerService: OfferService) {}

	@Get('public')
	@PublicAccess()
	@SerializeOptions({ type: PublicOfferWithPlanWithVolumesDto })
	async findAllPublicValid(): Promise<PublicOfferWithPlanWithVolumesDto[]> {
		return this.offerService.findAllPublicValidWithPlan();
	}
}

import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { PromoCodeActivation } from '@prisma/client';

import { PromoCodeService } from './promo-code.service';

@Injectable({ scope: Scope.REQUEST })
export class PromoCodeLoader {
	constructor(private readonly promoService: PromoCodeService) {}

	public readonly activationsByPromoCodeId = new DataLoader<
		string,
		PromoCodeActivation[]
	>(async (keys: readonly string[]) => {
		const map = await this.promoService.mapActivationsByPromoCodeId([...keys]);
		return keys.map((key) => map.get(key) ?? []);
	});
}

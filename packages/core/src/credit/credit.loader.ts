import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { Credit } from '@prisma/client';

import { PaginatedLoad } from '@/paginated';

import { CreditService } from './credit.service';
import { CreditFilterDto } from './dto/request/credit-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class CreditLoader {
	constructor(private readonly creditService: CreditService) {}

	public readonly byUserPaginated = new DataLoader<
		PaginatedLoad<string, CreditFilterDto>,
		Credit[]
	>(async (keys: readonly PaginatedLoad<string, CreditFilterDto>[]) => {
		const map = await this.creditService.mapByUserIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});
}

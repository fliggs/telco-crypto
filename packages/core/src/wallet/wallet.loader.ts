import { Injectable, Scope } from '@nestjs/common';
import { Wallet } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { PaginatedLoad } from '@/paginated';

import { WalletService } from './wallet.service';
import { WalletFilterDto } from './dto/request/wallet-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class WalletLoader {
	constructor(private readonly walletService: WalletService) {}

	public readonly byUserPaginated = new DataLoader<
		PaginatedLoad<string, WalletFilterDto>,
		Wallet[]
	>(async (keys: readonly PaginatedLoad<string, WalletFilterDto>[]) => {
		const map = await this.walletService.mapByUserIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});
}

import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { Address } from '@prisma/client';

import { AddressService } from './address.service';

@Injectable({ scope: Scope.REQUEST })
export class AddressLoader {
	constructor(private readonly addressService: AddressService) {}

	public readonly byUser = new DataLoader<string, Address[]>(
		async (keys: readonly string[]) => {
			const map = await this.addressService.mapByUserId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);
}

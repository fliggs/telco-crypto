import { Injectable, NotFoundException } from '@nestjs/common';

import { DbService } from '@/db/db.service';
import { Address, AddressType } from '@prisma/client';

import { AddressDto } from './dto/internal/address.dto';

@Injectable()
export class AddressService {
	constructor(private readonly db: DbService) {}

	async findByUser(userId: string) {
		return this.db.address.findMany({
			where: {
				userId: userId,
			},
		});
	}

	async findByUserAndType(userId: string, type: AddressType) {
		const addr = await this.db.address.findFirst({
			where: {
				userId: userId,
				type,
			},
		});
		if (!addr) {
			throw new NotFoundException('address_not_found');
		}
		return addr;
	}

	async mapByUserId(ids: string[]) {
		const addresses = await this.db.address.findMany({
			where: {
				userId: { in: ids },
			},
		});
		const map: Map<string, Address[]> = new Map();
		for (const addr of addresses) {
			let userAddrs = map.get(addr.userId);
			if (!userAddrs) {
				userAddrs = [];
				map.set(addr.userId, userAddrs);
			}
			userAddrs.push(addr);
		}
		return map;
	}

	async update(userId: string, type: AddressType, dto: AddressDto) {
		return this.db.address.upsert({
			where: {
				userId_type: {
					userId,
					type,
				},
			},
			create: {
				userId,
				type,
				name: dto.name,
				line1: dto.line1,
				line2: dto.line2,
				line3: dto.line3,
				line4: dto.line4,
				city: dto.city,
				postalCode: dto.postalCode,
				province: dto.province,
				country: dto.country,
			},
			update: {
				name: dto.name,
				line1: dto.line1,
				line2: dto.line2,
				line3: dto.line3,
				line4: dto.line4,
				city: dto.city,
				postalCode: dto.postalCode,
				province: dto.province,
				country: dto.country,
			},
		});
	}
}

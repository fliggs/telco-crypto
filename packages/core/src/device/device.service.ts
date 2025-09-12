import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DbService } from '@/db/db.service';

@Injectable()
export class DeviceService {
	constructor(private readonly db: DbService) {}

	async findMany(name?: string) {
		return this.db.device.findMany({
			where: {
				name: name ? { contains: name } : undefined,
			},
			orderBy: [
				{
					type: 'asc',
				},
				{
					name: 'asc',
				},
			],
		});
	}

	async create(args: Prisma.DeviceCreateInput) {
		return this.db.device.create({
			data: args,
		});
	}

	async save(id: string, args: Prisma.DeviceUpdateInput) {
		return this.db.device.update({
			where: {
				id,
			},
			data: args,
		});
	}

	async delete(id: string) {
		return this.db.device.delete({
			where: {
				id,
			},
		});
	}
}

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { DbService } from '@/db/db.service';

@Injectable()
export class CountryService {
	constructor(private readonly db: DbService) {}

	async findMany(name?: string) {
		return this.db.country.findMany({
			where: {
				name: name ? { contains: name } : undefined,
			},
			orderBy: [
				{
					favourite: 'desc',
				},
				{
					name: 'asc',
				},
			],
		});
	}

	async create(args: Prisma.CountryCreateInput) {
		return this.db.country.create({
			data: args,
		});
	}

	async save(id: string, args: Prisma.CountryUpdateInput) {
		return this.db.country.update({
			where: {
				id,
			},
			data: args,
		});
	}

	async delete(id: string) {
		return this.db.country.delete({
			where: {
				id,
			},
		});
	}
}

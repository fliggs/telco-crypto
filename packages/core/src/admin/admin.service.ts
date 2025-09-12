import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isUUID } from 'class-validator';

import { paginate, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';

import { AdminFilterDto } from './dto/request/filter.dto';

@Injectable()
export class AdminService {
	constructor(private readonly db: DbService) {}

	async findAll(filter?: AdminFilterDto, args?: PaginationArgs) {
		const search = filter?.search?.trim();

		return paginate(
			(take, skip, cursor) =>
				this.db.admin.findMany({
					where: search
						? {
								OR: [
									...(isUUID(search) ? [{ id: search }] : []),
									{
										email: {
											contains: search,
											mode: 'insensitive',
										},
									},
									{
										firstName: {
											contains: search,
											mode: 'insensitive',
										},
									},
									{
										lastName: {
											contains: search,
											mode: 'insensitive',
										},
									},
								],
							}
						: undefined,
					take,
					skip,
					cursor: cursor ? { id: cursor } : undefined,
				}),
			(item) => item.id,
			args,
		);
	}

	async findByEmail(email: string) {
		return this.db.admin.findFirst({
			where: {
				email: {
					equals: email,
					mode: 'insensitive',
				},
			},
		});
	}

	async findOne(id: string) {
		const admin = await this.db.admin.findUnique({
			where: {
				id,
			},
		});
		if (!admin) {
			throw new NotFoundException('admin_not_found');
		}
		return admin;
	}

	async upsert(admin: Prisma.AdminCreateInput) {
		return this.db.admin.upsert({
			where: {
				email: admin.email,
			},
			create: {
				...admin,
			},
			update: {
				...admin,
			},
		});
	}

	async create(admin: Prisma.AdminCreateInput) {
		return this.db.admin.create({
			data: admin,
		});
	}

	async reactivate(id: string) {
		return this.db.admin.update({
			where: {
				id,
			},
			data: {
				deletedAt: null,
			},
		});
	}

	async delete(id: string) {
		return this.db.admin.update({
			where: {
				id,
			},
			data: {
				deletedAt: new Date(),
			},
		});
	}
}

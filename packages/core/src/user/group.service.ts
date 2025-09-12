import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Prisma, UserGroup } from '@prisma/client';
import { isUUID } from 'class-validator';

import { paginate, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';

import { UserGroupFilterDto } from './dto/request/group-filter.dto';

@Injectable()
export class UserGroupService implements OnModuleInit {
	protected defaultGroup: UserGroup;

	constructor(private readonly db: DbService) {}

	async onModuleInit() {
		const defaultGroup = await this.db.userGroup.findFirst({
			where: {
				isDefaultGroup: true,
			},
		});
		if (!defaultGroup) {
			throw new Error('missing_default_group');
		}
		this.defaultGroup = defaultGroup;
	}

	getDefaultGroup() {
		return this.defaultGroup;
	}

	async findOne(id: string) {
		const group = await this.db.userGroup.findUnique({
			where: {
				id,
			},
		});
		if (!group) {
			throw new NotFoundException('user_group_not_found');
		}
		return group;
	}

	async findAll(filter?: UserGroupFilterDto, args?: PaginationArgs) {
		const search = filter?.search?.trim();

		return paginate(
			(take, skip, cursor) =>
				this.db.userGroup.findMany({
					where: search
						? {
								OR: [
									...(isUUID(search) ? [{ id: search }] : []),
									{
										name: {
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

	async mapByIds(ids: string[]) {
		const groups = await this.db.userGroup.findMany({
			where: {
				id: { in: ids },
			},
		});
		const map: Map<string, UserGroup> = new Map();
		for (const group of groups) {
			map.set(group.id, group);
		}
		return map;
	}

	async save(id: string, data: Prisma.UserGroupUpdateInput) {
		return this.db.userGroup.update({
			where: {
				id,
			},
			data,
		});
	}
}

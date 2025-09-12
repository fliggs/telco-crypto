import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { paginate, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';
import { EventsService } from '@/events/events.service';

import { UpdateUserDto } from './dto/internal/update-user.dto';
import { UserFilterDto } from './dto/request/user-filter.dto';
import { UserGroupService } from './group.service';
import { USER_EVENT_DELETED } from './user.events';
import {
	UserOrderByColumn,
	UserOrderByDto,
} from './dto/request/user-order-by.dto';

const DEFAULT_ORDER_BY: UserOrderByDto[] = [
	{ col: UserOrderByColumn.createdAt, dir: Prisma.SortOrder.desc },
];

@Injectable()
export class UserService {
	constructor(
		private readonly db: DbService,
		private readonly events: EventsService,
		private readonly groupService: UserGroupService,
	) {}

	async findByEmailWithGroupAndSettings(email: string) {
		const user = await this.db.user.findFirst({
			where: {
				email: {
					equals: email,
					mode: 'insensitive',
				},
			},
			include: {
				settings: true,
				group: true,
			},
		});
		if (!user) {
			throw new NotFoundException('user_not_found');
		}
		if (!user.group) {
			user.group = this.groupService.getDefaultGroup();
			user.groupId = user.group.id;
		}
		return user;
	}

	async findAuthStrategiesByEmail(email: string) {
		return this.db.userAuthData.findMany({
			where: {
				user: {
					email,
				},
			},
		});
	}

	async create(user: Prisma.UserCreateInput) {
		return this.db.user.create({
			data: {
				...user,
				settings: {
					create: {},
				},
			},
			include: {
				settings: true,
				group: true,
			},
		});
	}

	async findAll(
		filter?: UserFilterDto,
		orderBy?: UserOrderByDto[],
		args?: PaginationArgs,
	) {
		return paginate(
			(take, skip, cursor) =>
				this.db.user.findMany({
					where: {
						...(filter?.email
							? { email: { contains: filter.email, mode: 'insensitive' } }
							: {}),
						...(filter?.name
							? {
									OR: [
										{
											firstName: {
												contains: filter.name,
												mode: 'insensitive',
											},
										},
										{
											lastName: {
												contains: filter.name,
												mode: 'insensitive',
											},
										},
									],
								}
							: {}),
					},
					orderBy: (orderBy ?? [])
						.concat(DEFAULT_ORDER_BY)
						.map((o) => ({ [o.col]: o.dir })),
					take,
					skip,
					cursor: cursor ? { id: cursor } : undefined,
				}),
			(item) => item.id,
			args,
		);
	}

	async findOne(id: string) {
		const user = await this.db.user.findUnique({
			where: {
				id,
			},
		});
		if (!user) {
			throw new NotFoundException('user_not_found');
		}
		return user;
	}

	async mapByIds(ids: string[]) {
		const users = await this.db.user.findMany({
			where: {
				id: { in: ids },
			},
		});
		const map: Map<string, User> = new Map();
		for (const user of users) {
			map.set(user.id, user);
		}
		return map;
	}

	async update(id: string, dto: UpdateUserDto) {
		const user = await this.db.user.findUnique({
			where: {
				id,
			},
			include: {
				settings: true,
			},
		});
		if (!user) {
			throw new NotFoundException('user_not_found');
		}

		return this.db.user.update({
			where: {
				id,
			},
			data: {
				firstName: dto.firstName,
				lastName: dto.lastName,
				settings: {
					upsert: {
						create: {
							...user.settings,
							...dto.settings,
						},
						update: {
							...user.settings,
							...dto.settings,
						},
					},
				},
				groupId: typeof dto.groupId === 'undefined' ? undefined : dto.groupId,
			},
			include: {
				settings: true,
				group: true,
			},
		});
	}

	async reactivate(id: string) {
		return this.db.$transaction(async (tx) => {
			const oldUser = await tx.user.findUnique({
				where: {
					id,
				},
			});
			if (!oldUser) {
				throw new NotFoundException('user_not_found');
			}

			return tx.user.update({
				where: {
					id,
				},
				data: {
					email: oldUser.email
						.replace(new RegExp(`__${oldUser.id}__$`), '')
						.replace(/^__deleted__/, ''),
					deletedAt: null,
				},
			});
		});
	}

	async delete(id: string) {
		const user = await this.db.$transaction(async (tx) => {
			const oldUser = await tx.user.findUnique({
				where: {
					id,
				},
			});
			if (!oldUser) {
				throw new NotFoundException('user_not_found');
			}

			return tx.user.update({
				where: {
					id,
				},
				data: {
					email: `__deleted__${oldUser.email}__${oldUser.id}__`,
					deletedAt: new Date(),
				},
			});
		});

		this.events.emit(USER_EVENT_DELETED, user);

		return user;
	}
}

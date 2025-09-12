import { Injectable, NotFoundException } from '@nestjs/common';
import { Plan, PlanTaxData, PlanTelcoData, Prisma } from '@prisma/client';

import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';
import {
	DEFAULT_BILLING_EDGE,
	DEFAULT_BILLING_OFFSET,
	DEFAULT_TELCO_EDGE,
	DEFAULT_TELCO_OFFSET,
} from '@/defaults';
import { Content } from '@/content/dto/internal/content.dto';

import { CreatePlanDto } from './dto/request/create-plan.dto';
import { UpdatePlanDto } from './dto/request/update-plan.dto';
import { CreatePlanVersionDto } from './dto/request/create-plan-version.dto';
import { PlanTelcoDataInputDto } from './dto/request/plan-telco-data-input.dto';
import { PlanTaxDataInputDto } from './dto/request/plan-tax-data-input.dto';
import { PlanFilterDto } from './dto/request/plan-filter.dto';

@Injectable()
export class PlanService {
	constructor(private readonly db: DbService) {}

	async dynamicCreate(
		name: string,
		dto: CreatePlanDto,
		telcoData?: PlanTelcoDataInputDto[],
		taxData?: PlanTaxDataInputDto[],
	) {
		const content = dto.content as Content;

		return this.db.$transaction(async (tx) => {
			const plan = await tx.plan.findFirst({
				where: {
					name,
				},
				orderBy: [{ version: 'desc' }],
			});

			const version = plan ? plan.version + 1 : 1;

			return tx.plan.create({
				data: {
					name: name,
					version: version,
					isStandalone: dto.isStandalone,
					validForSeconds: dto.validForSeconds,
					doesAutoRenew: dto.doesAutoRenew,
					volumes: {
						create: dto.volumes,
					},
					content: content,
					telcoData: {
						create: telcoData?.map((d) => ({
							provider: d.provider,
							data: JSON.parse(d.data),
						})),
					},
					taxData: {
						create: taxData?.map((d) => ({
							provider: d.provider,
							data: JSON.parse(d.data),
						})),
					},
					// TODO: This data should come from the frontend
					telcoEdge: DEFAULT_TELCO_EDGE,
					telcoOffset: DEFAULT_TELCO_OFFSET,
					billingEdge: DEFAULT_BILLING_EDGE,
					billingOffset: DEFAULT_BILLING_OFFSET,
				},
			});
		});
	}

	async findAll(filter?: PlanFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.plan.findMany({
					where: {
						...(filter?.name
							? { name: { contains: filter.name, mode: 'insensitive' } }
							: null),
						...(typeof filter?.isStandalone === 'boolean'
							? { isStandalone: filter.isStandalone }
							: null),
					},
					orderBy: [
						{
							name: 'asc',
						},
						{
							version: 'desc',
						},
					],
					take,
					skip,
					cursor: cursor ? { id: cursor } : undefined,
				}),
			(item) => item.id,
			args,
		);
	}

	async mapByIds(ids: string[]) {
		const plans = await this.db.plan.findMany({
			where: {
				id: { in: ids },
			},
		});
		const map: Map<string, Plan> = new Map();
		for (const plan of plans) {
			map.set(plan.id, plan);
		}
		return map;
	}

	async mapByName(names: string[]) {
		const plans = await this.db.plan.findMany({
			where: {
				name: { in: names },
			},
			orderBy: [
				{
					name: 'asc',
				},
				{
					version: 'desc',
				},
			],
		});
		const map: Map<string, Plan[]> = new Map();
		for (const plan of plans) {
			let planPlans = map.get(plan.name);
			if (!planPlans) {
				planPlans = [];
				map.set(plan.name, planPlans);
			}
			planPlans.push(plan);
		}
		return map;
	}

	async mapParentsByPlanIdsPaginated(
		ids: PaginatedLoad<string, PlanFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT p.*, ptp."childId" FROM "Plan" AS p `;
			let where = Prisma.sql`WHERE ptp."childId" = ${id}::uuid`;
			let join = Prisma.sql`INNER JOIN "PlanToPlan" AS ptp ON ptp."parentId" = p.id`;
			if (filter) {
				if (filter.name) {
					where = Prisma.sql`${where} AND p."name" ILIKE '%${filter.name}%'`;
				}
				if (filter.isStandalone) {
					where = Prisma.sql`${where} AND p."isStandalone" = ${filter.isStandalone}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND p."name" <= (SELECT "name" FROM "Plan" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND p."name" >= (SELECT "name" FROM "Plan" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY p."name" ${Prisma.raw(take < 0 ? 'DESC' : 'ASC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const parents = await this.db.$queryRaw<
			(Plan & { childId: string })[]
		>`${query}`;

		const map: Map<string, Plan[]> = new Map();
		for (const parent of parents) {
			let planChildren = map.get(parent.childId);
			if (!planChildren) {
				planChildren = [];
				map.set(parent.childId, planChildren);
			}
			planChildren.push(parent);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapChildrenByPlanIdsPaginated(
		ids: PaginatedLoad<string, PlanFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT p.*, ptp."parentId" FROM "Plan" AS p `;
			let where = Prisma.sql`WHERE ptp."parentId" = ${id}::uuid`;
			let join = Prisma.sql`INNER JOIN "PlanToPlan" AS ptp ON ptp."childId" = p.id`;
			if (filter) {
				if (filter.name) {
					where = Prisma.sql`${where} AND p."name" ILIKE '%${filter.name}%'`;
				}
				if (filter.isStandalone) {
					where = Prisma.sql`${where} AND p."isStandalone" = ${filter.isStandalone}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND p."name" <= (SELECT "name" FROM "Plan" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND p."name" >= (SELECT "name" FROM "Plan" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY p."name" ${Prisma.raw(take < 0 ? 'DESC' : 'ASC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const children = await this.db.$queryRaw<
			(Plan & { parentId: string })[]
		>`${query}`;

		const map: Map<string, Plan[]> = new Map();
		for (const child of children) {
			let planParents = map.get(child.parentId);
			if (!planParents) {
				planParents = [];
				map.set(child.parentId, planParents);
			}
			planParents.push(child);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapTaxDataByPlanId(ids: string[]) {
		const taxDatas = await this.db.planTaxData.findMany({
			where: {
				planId: { in: ids },
			},
		});
		const map: Map<string, PlanTaxData[]> = new Map();
		for (const taxData of taxDatas) {
			let planTaxDatas = map.get(taxData.planId);
			if (!planTaxDatas) {
				planTaxDatas = [];
				map.set(taxData.planId, planTaxDatas);
			}
			planTaxDatas.push(taxData);
		}
		return map;
	}

	async mapTelcoDataByPlanId(ids: string[]) {
		const telcoDatas = await this.db.planTelcoData.findMany({
			where: {
				planId: { in: ids },
			},
		});
		const map: Map<string, PlanTelcoData[]> = new Map();
		for (const telcoData of telcoDatas) {
			let planTelcoDatas = map.get(telcoData.planId);
			if (!planTelcoDatas) {
				planTelcoDatas = [];
				map.set(telcoData.planId, planTelcoDatas);
			}
			planTelcoDatas.push(telcoData);
		}
		return map;
	}

	async findOne(id: string) {
		const plan = await this.db.plan.findUnique({
			where: {
				id,
			},
		});
		if (!plan) {
			throw new NotFoundException('plan_not_found');
		}
		return plan;
	}

	async findOneWithVolumes(id: string) {
		const plan = await this.db.plan.findUnique({
			where: {
				id,
			},
			include: {
				volumes: true,
			},
		});
		if (!plan) {
			throw new NotFoundException('plan_not_found');
		}
		return plan;
	}

	async findManyWithVolumes(ids: string[]) {
		const plan = await this.db.plan.findMany({
			where: {
				id: {
					in: ids,
				},
			},
			include: {
				volumes: true,
			},
		});
		if (!plan) {
			throw new NotFoundException('plan_not_found');
		}
		return plan;
	}

	async findTelcoData(id: string) {
		const data = await this.db.planTelcoData.findMany({
			where: {
				planId: id,
			},
		});
		if (!data) {
			throw new NotFoundException('plan_telco_data_not_found');
		}
		return data;
	}

	async findTaxData(id: string) {
		const pkg = await this.db.planTaxData.findMany({
			where: {
				planId: id,
			},
		});
		if (!pkg) {
			throw new NotFoundException('plan_tax_data_not_found');
		}
		return pkg;
	}

	async findVersions(id: string) {
		const plan = await this.db.plan.findUnique({
			where: {
				id,
			},
		});
		if (!plan) {
			throw new NotFoundException('plan_not_found');
		}

		return this.db.plan.findMany({
			where: {
				name: plan.name,
				NOT: {
					id,
				},
			},
			orderBy: [
				{
					version: 'desc',
				},
			],
		});
	}

	async update(id: string, dto: UpdatePlanDto) {
		const content = dto.content as Content | undefined;

		return this.db.plan.update({
			where: {
				id,
			},
			data: {
				content: content,
			},
		});
	}

	async link(parentId: string, childId: string) {
		return this.db.planToPlan.create({
			data: {
				parentId,
				childId,
			},
		});
	}

	async unlink(parentId: string, childId: string) {
		return this.db.planToPlan.delete({
			where: {
				parentId_childId: {
					parentId,
					childId,
				},
			},
		});
	}

	async createNewVersion(id: string, dto: CreatePlanVersionDto) {
		const content = dto.content as Content;

		return this.db.$transaction(async (tx) => {
			const plan = await tx.plan.findUnique({
				where: {
					id,
				},
				include: {
					taxData: true,
					telcoData: true,
				},
			});

			// TODO: Check that we can only change the newest version of the plan
			// (currently implicitly throws an error because of duplicate key)
			if (!plan) {
				throw new NotFoundException('plan_not_found');
			}

			return tx.plan.create({
				data: {
					name: plan.name,
					version: plan.version + 1,
					isStandalone: plan.isStandalone,
					validForSeconds: dto.validForSeconds,
					doesAutoRenew: dto.doesAutoRenew,
					telcoEdge: plan.telcoEdge,
					telcoOffset: plan.telcoOffset,
					billingEdge: plan.billingEdge,
					billingOffset: plan.billingOffset,
					content: content,
					volumes: {
						create: dto.volumes,
					},
					taxData: {
						create: plan.taxData.map(({ id, ...taxData }) => taxData),
					},
					telcoData: {
						create: plan.telcoData.map(({ id, ...telcoData }) => telcoData),
					},
				},
			});
		});
	}
}

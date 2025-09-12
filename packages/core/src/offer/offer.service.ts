import { Injectable, NotFoundException } from '@nestjs/common';
import { Offer, Prisma } from '@prisma/client';

import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';
import { Content } from '@/content/dto/internal/content.dto';

import { UpdateOfferDto } from './dto/request/update-offer.dto';
import { CreateOfferDto } from './dto/request/create-offer.dto';
import { CreateOfferVersionDto } from './dto/request/create-offer-version.dto';
import { OfferFilterDto } from './dto/request/filter.dto';

@Injectable()
export class OfferService {
	constructor(private readonly db: DbService) {}

	async dynamicCreate(name: string, dto: CreateOfferDto) {
		const content = dto.content as Content;

		return this.db.$transaction(async (tx) => {
			const offer = await tx.offer.findFirst({
				where: {
					name,
				},
				orderBy: [{ version: 'desc' }],
			});

			const version = offer ? offer.version + 1 : 1;

			return tx.offer.create({
				data: {
					name: name,
					version: version,
					legalId: dto.legalId,
					planId: dto.planId,
					sort: dto.sort,
					isActive: dto.isActive,
					isPublic: dto.isPublic,
					cost: dto.cost,
					originalCost: dto.originalCost,
					providedCredits: dto.providedCredits,
					validFrom: dto.validFrom,
					validUntil: dto.validUntil,
					content: content,
				},
			});
		});
	}

	async findAll(filter?: OfferFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.offer.findMany({
					where: {
						...(filter?.name
							? { name: { contains: filter.name, mode: 'insensitive' } }
							: null),
						...(typeof filter?.planIsStandalone === 'boolean'
							? { plan: { isStandalone: filter.planIsStandalone } }
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

	async findAllPublicValidWithPlan() {
		const now = new Date();

		return this.db.offer.findMany({
			where: {
				isActive: true,
				isPublic: true,
				OR: [
					{ validFrom: null, validUntil: null },
					{ validFrom: null, validUntil: { gt: now } },
					{ validFrom: { lte: now }, validUntil: null },
					{ validFrom: { lte: now }, validUntil: { gt: now } },
				],
			},
			distinct: 'name',
			orderBy: [
				{
					sort: 'asc',
				},
				{
					name: 'asc',
				},
				{
					version: 'desc',
				},
			],
			include: {
				plan: {
					include: {
						volumes: true,
					},
				},
			},
		});
	}

	async findAllPublicValidChildrenByPlanWithPlan(planId: string) {
		const now = new Date();

		return this.db.offer.findMany({
			where: {
				isActive: true,
				isPublic: true,
				OR: [
					{ validFrom: null, validUntil: null },
					{ validFrom: null, validUntil: { gt: now } },
					{ validFrom: { lte: now }, validUntil: null },
					{ validFrom: { lte: now }, validUntil: { gt: now } },
				],
				plan: {
					parents: {
						some: {
							parentId: planId,
						},
					},
				},
			},
			distinct: 'name',
			orderBy: [
				{
					sort: 'asc',
				},
				{
					name: 'asc',
				},
				{
					version: 'desc',
				},
			],
			include: {
				plan: {
					include: {
						volumes: true,
					},
				},
			},
		});
	}

	async findOne(id: string) {
		const offer = await this.db.offer.findUnique({
			where: {
				id,
			},
		});
		if (!offer) {
			throw new NotFoundException('offer_not_found');
		}
		return offer;
	}

	async findOnePublicValid(id: string) {
		const now = new Date();

		const offer = await this.db.offer.findUnique({
			where: {
				id,
				isActive: true,
				isPublic: true,
				OR: [
					{ validFrom: null, validUntil: null },
					{ validFrom: null, validUntil: { gt: now } },
					{ validFrom: { lte: now }, validUntil: null },
					{ validFrom: { lte: now }, validUntil: { gt: now } },
				],
			},
		});
		if (!offer) {
			throw new NotFoundException('offer_not_found');
		}
		return offer;
	}

	async findOneWithPromoAndValid(id: string, promoCodeId: string) {
		const now = new Date();

		const offer = await this.db.offer.findUnique({
			where: {
				id,
				isActive: true,
				promoCodes: {
					some: {
						id: promoCodeId,
						isActive: true,
						OR: [
							{ validFrom: null, validUntil: null },
							{ validFrom: null, validUntil: { gt: now } },
							{ validFrom: { lte: now }, validUntil: null },
							{ validFrom: { lte: now }, validUntil: { gt: now } },
						],
					},
				},
				OR: [
					{ validFrom: null, validUntil: null },
					{ validFrom: null, validUntil: { gt: now } },
					{ validFrom: { lte: now }, validUntil: null },
					{ validFrom: { lte: now }, validUntil: { gt: now } },
				],
			},
		});
		if (!offer) {
			throw new NotFoundException('offer_not_found');
		}
		return offer;
	}

	async findVersions(id: string) {
		const offer = await this.db.offer.findUnique({
			where: {
				id,
			},
		});
		if (!offer) {
			throw new NotFoundException('offer_not_found');
		}

		return this.db.offer.findMany({
			where: {
				name: offer.name,
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

	async mapByIds(ids: string[]) {
		const offers = await this.db.offer.findMany({
			where: {
				id: { in: ids },
			},
		});
		const map: Map<string, Offer> = new Map();
		for (const offer of offers) {
			map.set(offer.id, offer);
		}
		return map;
	}

	async mapByPromoCodeIds(ids: string[]) {
		const offers = await this.db.offer.findMany({
			where: {
				promoCodes: { some: { id: { in: ids } } },
			},
			include: {
				promoCodes: true,
			},
		});
		const map: Map<string, Offer[]> = new Map();
		for (const offer of offers) {
			for (const promoCode of offer.promoCodes) {
				let promoCodeOffers = map.get(promoCode.id);
				if (!promoCodeOffers) {
					promoCodeOffers = [];
					map.set(promoCode.id, promoCodeOffers);
				}
				promoCodeOffers.push(offer);
			}
		}
		return map;
	}

	async mapByPromoCodeIdsPaginated(
		ids: PaginatedLoad<string, OfferFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT o.*, otpc."B" as "promoCodeId" FROM "Offer" AS o `;
			let where = Prisma.sql`WHERE otpc."B" = ${id}::uuid`;
			let join = Prisma.sql`INNER JOIN "_OfferToPromoCode" AS otpc ON otpc."A" = o.id`;
			if (filter) {
				if (filter.name) {
					where = Prisma.sql`${where} AND o."name" ILIKE '%${filter.name}%'`;
				}
				if (filter.planIsStandalone) {
					join = Prisma.sql`${join} INNER JOIN "Plan" AS p ON p.id = o."planId"`;
					where = Prisma.sql`${where} AND p."isStandalone" = ${filter.planIsStandalone}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND o."name" <= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND o."name" >= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY o."name" ${Prisma.raw(take < 0 ? 'DESC' : 'ASC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const offers = await this.db.$queryRaw<
			(Offer & { promoCodeId: string })[]
		>`${query}`;

		const map: Map<string, Offer[]> = new Map();
		for (const offer of offers) {
			let promoCodeOffers = map.get(offer.promoCodeId);
			if (!promoCodeOffers) {
				promoCodeOffers = [];
				map.set(offer.promoCodeId, promoCodeOffers);
			}
			promoCodeOffers.push(offer);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapByRewardIdsPaginated(ids: PaginatedLoad<string, OfferFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT o.*, otr."B" as "rewardId" FROM "Offer" AS o `;
			let where = Prisma.sql`WHERE otr."B" = ${id}::uuid`;
			let join = Prisma.sql`INNER JOIN "_OfferToReward" AS otr ON otr."A" = o.id`;
			if (filter) {
				if (filter.name) {
					where = Prisma.sql`${where} AND o."name" ILIKE '%${filter.name}%'`;
				}
				if (filter.planIsStandalone) {
					join = Prisma.sql`${join} INNER JOIN "Plan" AS p ON p.id = o."planId"`;
					where = Prisma.sql`${where} AND p."isStandalone" = ${filter.planIsStandalone}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND o."name" <= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND o."name" >= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY o."name" ${Prisma.raw(take < 0 ? 'DESC' : 'ASC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const offers = await this.db.$queryRaw<
			(Offer & { rewardId: string })[]
		>`${query}`;

		const map: Map<string, Offer[]> = new Map();
		for (const offer of offers) {
			let rewardOffers = map.get(offer.rewardId);
			if (!rewardOffers) {
				rewardOffers = [];
				map.set(offer.rewardId, rewardOffers);
			}
			rewardOffers.push(offer);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapParentsByOfferIdsPaginated(
		ids: PaginatedLoad<string, OfferFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT o.*, oto."childId" FROM "Offer" AS o `;
			let where = Prisma.sql`WHERE oto."childId" = ${id}::uuid`;
			let join = Prisma.sql`INNER JOIN "OfferToOffer" AS oto ON oto."parentId" = o.id`;
			if (filter) {
				if (filter.name) {
					where = Prisma.sql`${where} AND o."name" ILIKE '%${filter.name}%'`;
				}
				if (filter.planIsStandalone) {
					join = Prisma.sql`${join} INNER JOIN "Plan" AS p ON p.id = o."planId"`;
					where = Prisma.sql`${where} AND p."isStandalone" = ${filter.planIsStandalone}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND o."name" <= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND o."name" >= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY o."name" ${Prisma.raw(take < 0 ? 'DESC' : 'ASC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const parents = await this.db.$queryRaw<
			(Offer & { childId: string })[]
		>`${query}`;

		const map: Map<string, Offer[]> = new Map();
		for (const parent of parents) {
			let offerChildren = map.get(parent.childId);
			if (!offerChildren) {
				offerChildren = [];
				map.set(parent.childId, offerChildren);
			}
			offerChildren.push(parent);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapChildrenByOfferIdsPaginated(
		ids: PaginatedLoad<string, OfferFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT o.*, oto."parentId" FROM "Offer" AS o `;
			let where = Prisma.sql`WHERE oto."parentId" = ${id}::uuid`;
			let join = Prisma.sql`INNER JOIN "OfferToOffer" AS oto ON oto."childId" = o.id`;
			if (filter) {
				if (filter.name) {
					where = Prisma.sql`${where} AND o."name" ILIKE '%${filter.name}%'`;
				}
				if (filter.planIsStandalone) {
					join = Prisma.sql`${join} INNER JOIN "Plan" AS p ON p.id = o."planId"`;
					where = Prisma.sql`${where} AND p."isStandalone" = ${filter.planIsStandalone}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND o."name" <= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND o."name" >= (SELECT "name" FROM "Offer" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY o."name" ${Prisma.raw(take < 0 ? 'DESC' : 'ASC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const children = await this.db.$queryRaw<
			(Offer & { parentId: string })[]
		>`${query}`;

		const map: Map<string, Offer[]> = new Map();
		for (const child of children) {
			let offerParents = map.get(child.parentId);
			if (!offerParents) {
				offerParents = [];
				map.set(child.parentId, offerParents);
			}
			offerParents.push(child);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async update(id: string, dto: UpdateOfferDto) {
		const content = dto.content as Content | undefined;

		return this.db.offer.update({
			where: {
				id,
			},
			data: {
				legalId: dto.legalId,
				isActive: dto.isActive,
				isPublic: dto.isPublic,
				sort: dto.sort,
				content: content,
			},
		});
	}

	async createNewVersion(id: string, dto: CreateOfferVersionDto) {
		const content = dto.content as Content;

		return this.db.$transaction(async (tx) => {
			const offer = await tx.offer.findUnique({
				where: {
					id,
				},
			});

			// TODO: Check that we can only change the newest version of the offer
			// (currently implicitly throws an error because of duplicate key)
			if (!offer) {
				throw new NotFoundException('offer_not_found');
			}

			return tx.offer.create({
				data: {
					name: offer.name,
					version: offer.version + 1,
					legalId: offer.legalId,
					planId: dto.planId,
					sort: dto.sort,
					isActive: dto.isActive,
					isPublic: dto.isPublic,
					cost: dto.cost,
					originalCost: dto.originalCost,
					providedCredits: dto.providedCredits,
					validFrom: dto.validFrom,
					validUntil: dto.validUntil,
					content: content,
				},
			});
		});
	}

	async link(parentId: string, childId: string) {
		return this.db.offerToOffer.create({
			data: {
				parentId,
				childId,
			},
		});
	}

	async unlink(parentId: string, childId: string) {
		return this.db.offerToOffer.delete({
			where: {
				parentId_childId: {
					parentId,
					childId,
				},
			},
		});
	}
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PromoCodeActivation } from '@prisma/client';

import { DbService } from '@/db/db.service';
import { UserService } from '@/user/user.service';
import { paginate, PaginationArgs } from '@/paginated';
import { Content } from '@/content/dto/internal/content.dto';

import { CreatePromoCodeDto } from './dto/request/create-promo-code.dto';
import { PromoCodeFilterDto } from './dto/request/promo-code-filter.dto';
import { UpdatePromoCodeDto } from './dto/internal/update-promo-code.dto';

@Injectable()
export class PromoCodeService {
	constructor(
		private readonly db: DbService,
		private readonly userService: UserService,
	) {}

	async findAll() {
		return this.db.promoCode.findMany({});
	}

	async findAllPaginated(filter?: PromoCodeFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.promoCode.findMany({
					where: {
						...(filter?.code ? { code: { contains: filter.code } } : null),
					},
					take,
					skip,
					cursor: cursor ? { id: cursor } : undefined,
				}),
			(item) => item.id,
			args,
		);
	}

	async findOneByCode(code: string) {
		const promo = await this.db.promoCode.findUnique({
			where: {
				code,
				isActive: true,
			},
			include: {
				offers: {
					include: {
						plan: {
							include: {
								volumes: true,
							},
						},
					},
				},
			},
		});
		if (!promo) {
			throw new NotFoundException('promo_code_not_found');
		}
		return promo;
	}

	async findOne(id: string) {
		const promo = await this.db.promoCode.findUnique({
			where: {
				id,
			},
		});
		if (!promo) {
			throw new NotFoundException('promo_code_not_found');
		}
		return promo;
	}

	async findActivationsByOrder(orderId: string) {
		return this.db.promoCodeActivation.findMany({
			where: {
				orderId: orderId,
			},
		});
	}

	async findActivations(id: string) {
		return this.db.promoCodeActivation.findMany({
			where: {
				promoCodeId: id,
			},
		});
	}

	async mapActivationsByPromoCodeId(ids: string[]) {
		const activations = await this.db.promoCodeActivation.findMany({
			where: {
				promoCodeId: { in: ids },
			},
		});
		const map: Map<string, PromoCodeActivation[]> = new Map();
		for (const activation of activations) {
			let promoCodeActivations = map.get(activation.promoCodeId);
			if (!promoCodeActivations) {
				promoCodeActivations = [];
				map.set(activation.promoCodeId, promoCodeActivations);
			}
			promoCodeActivations.push(activation);
		}
		return map;
	}

	async create(dto: CreatePromoCodeDto) {
		const content = dto.content as Content;
		const user = dto.receiverEmail
			? await this.userService
					.findByEmailWithGroupAndSettings(dto.receiverEmail)
					.catch(() => null)
			: null;

		return this.db.promoCode.create({
			data: {
				code: dto.code,
				isActive: dto.isActive,
				maxActivations: dto.maxActivations,
				receiverEmail: dto.receiverEmail,
				receiverId: user?.id ?? null,
				validFrom: dto.validFrom,
				validUntil: dto.validUntil,
				content: content,
				offers: {
					connect: dto.offerIds.map((id) => ({ id })),
				},
			},
		});
	}

	async update(id: string, dto: UpdatePromoCodeDto) {
		const content = dto.content as Content;

		return this.db.promoCode.update({
			where: {
				id,
			},
			data: {
				isActive: dto.isActive,
				content: content,
			},
		});
	}

	async linkOffer(id: string, offerId: string) {
		return this.db.promoCode.update({
			where: {
				id,
			},
			data: {
				offers: {
					connect: { id: offerId },
				},
			},
		});
	}

	async unlinkOffer(id: string, offerId: string) {
		return this.db.promoCode.update({
			where: {
				id,
			},
			data: {
				offers: {
					disconnect: { id: offerId },
				},
			},
		});
	}

	async activate(id: string, orderId: string) {
		return this.db.promoCode.update({
			where: {
				id,
				OR: [
					{ usedActivations: { lt: this.db.promoCode.fields.maxActivations } },
					{ maxActivations: null },
				],
			},
			data: {
				usedActivations: { increment: 1 },
				activations: {
					create: {
						orderId,
					},
				},
			},
		});
	}

	async attachActivationToSubscription(id: string, subscriptionId: string) {
		return this.db.promoCodeActivation.update({
			where: {
				id,
			},
			data: {
				subscriptionId,
			},
		});
	}
}

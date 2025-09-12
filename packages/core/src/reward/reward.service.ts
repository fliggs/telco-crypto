import {
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import {
	Offer,
	Order,
	Prisma,
	Reward,
	RewardPayout,
	RewardType,
	Subscription,
} from '@prisma/client';

import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { DbService } from '@/db/db.service';
import { WalletService } from '@/wallet/wallet.service';
import { OfferService } from '@/offer/offer.service';
import { Content } from '@/content/dto/internal/content.dto';
import { SubscriptionService } from '@/subscription/subscription.service';

import { CashbackCryptoDto } from './dto/internal/cashback-crypto.dto';
import { RewardFilterDto } from './dto/request/filter.dto';
import { CreateRewardDto } from './dto/request/create.dto';

@Injectable()
export class RewardService {
	protected readonly logger = new Logger(RewardService.name);

	constructor(
		private readonly db: DbService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		private readonly walletService: WalletService,
		private readonly offerService: OfferService,
	) {}

	async create(dto: CreateRewardDto) {
		const content = dto.content as Content;

		return this.db.reward.create({
			data: {
				name: dto.name,
				type: dto.type,
				isActive: dto.isActive,
				validFrom: dto.validFrom,
				validUntil: dto.validUntil,
				content: content,
				data: JSON.parse(dto.data),
			},
		});
	}

	async findAll(filter?: RewardFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.reward.findMany({
					where: {
						...(filter?.name
							? { name: { contains: filter.name, mode: 'insensitive' } }
							: null),
					},
					orderBy: [
						{
							name: 'asc',
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

	async findOne(id: string) {
		const reward = await this.db.reward.findUnique({
			where: {
				id,
			},
		});
		if (!reward) {
			throw new NotFoundException('reward_not_found');
		}
		return reward;
	}

	async findByOffer(offerId: string) {
		return this.db.reward.findMany({
			where: {
				isActive: true,
				offers: {
					some: {
						id: offerId,
					},
				},
			},
		});
	}

	async findValidByOffer(offerId: string) {
		return this.db.reward.findMany({
			where: {
				isActive: true,
				offers: {
					some: {
						id: offerId,
					},
				},
				OR: [
					{
						validFrom: null,
						validUntil: null,
					},
					{
						validFrom: { lte: new Date() },
						validUntil: null,
					},
					{
						validFrom: null,
						validUntil: { gt: new Date() },
					},
					{
						validFrom: { lte: new Date() },
						validUntil: { gt: new Date() },
					},
				],
			},
		});
	}

	async mapByOfferIdsPaginated(ids: PaginatedLoad<string, RewardFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT r.*, otr."A" as "offerId" FROM "Reward" AS r `;
			let where = Prisma.sql`WHERE otr."A" = ${id}::uuid`;
			let join = Prisma.sql`INNER JOIN "_OfferToReward" AS otr ON otr."B" = r.id`;
			if (filter) {
				if (filter.name) {
					where = Prisma.sql`${where} AND r."name" ILIKE '%${filter.name}%'`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND r."name" <= (SELECT "name" FROM "Reward" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND r."name" >= (SELECT "name" FROM "Reward" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY r."name" ${Prisma.raw(take < 0 ? 'DESC' : 'ASC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const rewards = await this.db.$queryRaw<
			(Reward & { offerId: string })[]
		>`${query}`;

		const map: Map<string, Reward[]> = new Map();
		for (const reward of rewards) {
			let offerRewards = map.get(reward.offerId);
			if (!offerRewards) {
				offerRewards = [];
				map.set(reward.offerId, offerRewards);
			}
			offerRewards.push(reward);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async processReward(
		reward: Reward,
		sub: Subscription,
		offer: Offer,
		order: Order,
	): Promise<RewardPayout | string> {
		switch (reward.type) {
			case RewardType.CASHBACK_CRYPTO: {
				const data = reward.data as CashbackCryptoDto;

				if (sub.parentId) {
					this.logger.warn(
						`Skipping rewards for order ${order.id}, sub ${sub.id} because it is non-standalone`,
					);
					return 'not_eligible:not_base_subscription';
				}

				const existingPayout = await this.db.rewardPayout.findFirst({
					where: {
						userId: order.userId,
						rewardId: reward.id,
						offerId: offer.id,
					},
				});
				if (existingPayout) {
					return `already_payed_out:${existingPayout.id}`;
				}

				// TODO: Make this configurable?
				const activeSubCount =
					await this.subService.countActiveStandaloneByUser(order.userId);
				const pct = activeSubCount > 1 ? 0.1 : activeSubCount === 1 ? 0.05 : 0;

				const usdAmount = offer.cost.mul(pct);

				const description =
					data.description ?? `Cashback for your subscription`;

				this.logger.log(
					`Paying out $${usdAmount} (= $${offer.cost} * ${pct * 100}% [${activeSubCount} subs]) crypto cashback for order ${order.id}`,
				);

				const res = await this.walletService.cashback(
					data.provider,
					order,
					usdAmount,
					description,
				);

				const payout = await this.db.rewardPayout.create({
					data: {
						userId: order.userId,
						rewardId: reward.id,
						offerId: offer.id,
						cost: usdAmount,
						data: {
							cost: offer.cost,
							factor: pct,
							activeSubCount,
							result: res,
						},
					},
				});

				return payout;
			}

			default: {
				throw new InternalServerErrorException(
					`unknown_reward_type:${reward.type}`,
				);
			}
		}
	}
}

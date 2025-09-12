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
	OrderStatus,
	Prisma,
	PrismaClient,
	Sim,
	SimType,
	Subscription,
	SubscriptionHistory,
	SubscriptionPeriod,
	SubscriptionPeriodStatus,
	SubscriptionStatus,
} from '@prisma/client';
import { add, sub } from 'date-fns';
import { Cron } from '@nestjs/schedule';

import { shortId } from '@/util';
import { USAGE_TRACK_INTERVAL } from '@/defaults';
import { DbService } from '@/db/db.service';
import { EventsService } from '@/events/events.service';
import { OfferService } from '@/offer/offer.service';
import { SimService } from '@/sim/sim.service';
import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { PhoneNumberService } from '@/phone-number/phone-number.service';
import { PlanService } from '@/plan/plan.service';
import { TelcoService } from '@/telco/telco.service';
import { SubscriptionWithVolumes } from '@/telco/dto/internal/get-sub-usage';
import {
	FINAL_STATI,
	OrderService,
	PENDING_STATI,
} from '@/order/order.service';

import { CreateSubscriptionDto } from './dto/internal/create-subscription.dto';
import { SubscriptionFilterDto } from './dto/request/subscription-filter.dto';
import { SubscriptionPeriodFilterDto } from './dto/request/subscription-period-filter.dto';
import {
	SUBSCRIPTION_EVENT_ACTIVATED,
	SUBSCRIPTION_EVENT_CANCELLED,
	SUBSCRIPTION_EVENT_CREATED,
	SUBSCRIPTION_EVENT_DEACTIVATED,
	SUBSCRIPTION_EVENT_REACTIVATED,
	SUBSCRIPTION_EVENT_SUSPENDED,
	SUBSCRIPTION_EVENT_UNCANCELLED,
} from './subscription.events';

export const MAX_CONCURRENT_SUBS = 4;
export const INTERVAL_DRIFT = 0.1;

// We subtract 1/10th second from the next statement to stop the time from drifting later and later
const INTERVAL = USAGE_TRACK_INTERVAL - INTERVAL_DRIFT;

@Injectable()
export class SubscriptionService {
	protected readonly logger = new Logger(SubscriptionService.name);

	constructor(
		private readonly db: DbService,
		private readonly events: EventsService,
		private readonly offerService: OfferService,
		@Inject(forwardRef(() => OrderService))
		private readonly orderService: OrderService,
		@Inject(forwardRef(() => SimService))
		private readonly simService: SimService,
		@Inject(forwardRef(() => PhoneNumberService))
		private readonly phoneNumService: PhoneNumberService,
		private readonly planService: PlanService,
		private readonly telcoService: TelcoService,
	) {}

	async countActiveStandaloneByUser(userId: string) {
		return this.db.subscription.count({
			where: {
				userId,
				status: SubscriptionStatus.ACTIVE,
				parentId: null,
			},
		});
	}

	async findAll(filter?: SubscriptionFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.subscription
					.findMany({
						where: {
							...(filter?.status ? { status: filter.status } : null),
							...(filter?.msisdn
								? { phoneNumberMsisdn: { contains: filter.msisdn } }
								: null),
							...(filter?.iccid
								? { simIccid: { contains: filter.iccid } }
								: null),
							...(filter?.hasParent === true
								? { parentId: { not: null } }
								: filter?.hasParent === false
									? { parentId: null }
									: null),
							...(filter?.email
								? {
										user: {
											email: { contains: filter.email, mode: 'insensitive' },
										},
									}
								: null),
						},
						take,
						skip,
						cursor: cursor ? { id: cursor } : undefined,
					})
					.then((items) => {
						if (filter?.id) {
							const filtered = items.filter((s) => {
								if (!s.id) return false;
								const shortIdValue = shortId(s.id);
								if (!shortIdValue) return false;
								return shortIdValue
									.toLowerCase()
									.startsWith(filter.id!.toLowerCase());
							});
							return filtered.slice(0, take || 10);
						}
						return items;
					}),
			(item) => item.id,
			args,
		);
	}

	async findByUser(userId: string) {
		return this.db.subscription.findMany({
			where: {
				userId: userId,
			},
		});
	}

	async findByUserWithCurrentPeriodAndOffer(
		userId: string,
		baseOnly?: boolean,
	) {
		return this.db.subscription.findMany({
			where: {
				userId: userId,
				parentId: baseOnly ? null : undefined,
			},
			include: {
				currentPeriod: true,
				offer: {
					include: {
						plan: true,
					},
				},
			},
		});
	}

	async findOne(id: string) {
		const sub = await this.db.subscription.findUnique({
			where: {
				id,
			},
		});
		if (!sub) {
			throw new NotFoundException('subscription_not_found');
		}
		return sub;
	}

	async findOneSimple(id: string) {
		const sub = await this.db.subscription.findUnique({
			where: {
				id,
			},
		});
		if (!sub) {
			throw new NotFoundException('subscription_not_found');
		}
		return sub;
	}

	async findOneForUserWithCurrentPeriodAndOfferAndPlan(
		id: string,
		userId: string,
	) {
		const sub = await this.db.subscription.findUnique({
			where: {
				id,
				userId,
			},
			include: {
				currentPeriod: true,
				offer: {
					include: {
						plan: true,
					},
				},
			},
		});
		if (!sub) {
			throw new NotFoundException('subscription_not_found');
		}
		return sub;
	}

	async findOneForUserWithOfferAndPlanAndVolumes(id: string, userId: string) {
		const sub = await this.db.subscription.findUnique({
			where: {
				id,
				userId,
			},
			include: {
				offer: {
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
		if (!sub) {
			throw new NotFoundException('subscription_not_found');
		}
		return sub;
	}

	async findOneBySimWithOfferAndPlanAndVolumes(iccid: string) {
		const sub = await this.db.subscription.findUnique({
			where: {
				simIccid: iccid,
			},
			include: {
				offer: {
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
		return sub;
	}

	async findOneBySimAndPhoneNumberSimple(iccid: string, msisdn: string) {
		const sub = await this.db.subscription.findUnique({
			where: {
				simIccid: iccid,
				phoneNumberMsisdn: msisdn,
			},
		});
		if (!sub) {
			throw new NotFoundException('subscription_not_found');
		}
		return sub;
	}

	async findChildrenForUserWithCurrentPeriodAndOffer(
		id: string,
		userId: string,
	) {
		return this.db.subscription.findMany({
			where: {
				parentId: id,
				userId,
			},
			include: {
				currentPeriod: true,
				offer: {
					include: {
						plan: true,
					},
				},
			},
		});
	}

	async findPeriodSimple(periodId: string) {
		const subPeriod = await this.db.subscriptionPeriod.findUnique({
			where: {
				id: periodId,
			},
		});
		if (!subPeriod) {
			throw new NotFoundException('subscription_period_not_found');
		}
		return subPeriod;
	}

	async findPeriodsBySubscriptionWithOffer(id: string) {
		return this.db.subscriptionPeriod.findMany({
			where: {
				subscriptionId: id,
			},
			orderBy: [{ startsAt: 'desc' }],
			include: {
				offer: {
					include: {
						plan: true,
					},
				},
			},
		});
	}

	async findChildrenWithOfferAndPlanAndVolumes(id: string) {
		return this.db.subscription.findMany({
			where: {
				parentId: id,
			},
			include: {
				offer: {
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
	}

	async mapByUserIdsPaginated(
		ids: PaginatedLoad<string, SubscriptionFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[0];
			const sel = Prisma.sql`SELECT s.* FROM "Subscription" AS s `;
			let where = Prisma.sql`WHERE s."userId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND s."status"::text = ${filter.status}`;
				}
				if (filter.iccid) {
					where = Prisma.sql`${where} AND s."simIccid" = ${filter.iccid}`;
				}
				if (filter.msisdn) {
					where = Prisma.sql`${where} AND s."phoneNumberMsisdn" = ${filter.msisdn}`;
				}
				if (typeof filter.hasParent === 'boolean') {
					where = Prisma.sql`${where} AND s."parentId" IS ${filter.hasParent ? Prisma.raw('NOT NULL') : Prisma.raw('NULL')}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND s."updatedAt" >= (SELECT "updatedAt" FROM "Subscription" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND s."updatedAt" <= (SELECT "updatedAt" FROM "Subscription" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY s."updatedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const subs = await this.db.$queryRaw<Subscription[]>`${query}`;

		const map: Map<string, Subscription[]> = new Map();
		for (const sub of subs) {
			let userSubs = map.get(sub.userId);
			if (!userSubs) {
				userSubs = [];
				map.set(sub.userId, userSubs);
			}
			userSubs.push(sub);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapByCurrentSimIccid(simIccids: string[]) {
		const subs = await this.db.subscription.findMany({
			where: {
				simIccid: { in: simIccids },
			},
		});
		const map: Map<string, Subscription> = new Map();
		for (const sub of subs) {
			if (!sub.simIccid) {
				continue;
			}

			map.set(sub.simIccid, sub);
		}
		return map;
	}

	async mapByCurrentPhoneNumberMsisdn(phoneNumMsisdns: string[]) {
		const subs = await this.db.subscription.findMany({
			where: {
				phoneNumberMsisdn: { in: phoneNumMsisdns },
			},
		});
		const map: Map<string, Subscription> = new Map();
		for (const sub of subs) {
			if (!sub.phoneNumberMsisdn) {
				continue;
			}

			map.set(sub.phoneNumberMsisdn, sub);
		}
		return map;
	}

	async mapChildrenBySubscriptionIdsPaginated(
		ids: PaginatedLoad<string, SubscriptionFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT s.* FROM "Subscription" AS s `;
			let where = Prisma.sql`WHERE s."parentId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND s."status"::text = ${filter.status}`;
				}
				if (filter.iccid) {
					where = Prisma.sql`${where} AND s."simIccid" = ${filter.iccid}`;
				}
				if (filter.msisdn) {
					where = Prisma.sql`${where} AND s."phoneNumberMsisdn" = ${filter.msisdn}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND s."updatedAt" >= (SELECT "updatedAt" FROM "Subscription" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND s."updatedAt" <= (SELECT "updatedAt" FROM "Subscription" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY s."updatedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const children = await this.db.$queryRaw<Subscription[]>`${query}`;

		const map: Map<string, Subscription[]> = new Map();
		for (const child of children) {
			if (!child.parentId) {
				continue;
			}

			let subChildren = map.get(child.parentId);
			if (!subChildren) {
				subChildren = [];
				map.set(child.parentId, subChildren);
			}
			subChildren.push(child);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapPeriodsById(periodIds: string[]) {
		const periods = await this.db.subscriptionPeriod.findMany({
			where: {
				id: { in: periodIds },
			},
		});
		const map: Map<string, SubscriptionPeriod> = new Map();
		for (const period of periods) {
			map.set(period.id, period);
		}
		return map;
	}

	async mapPeriodsBySubscriptionIdsPaginated(
		ids: PaginatedLoad<string, SubscriptionPeriodFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT sp.* FROM "SubscriptionPeriod" AS sp `;
			let where = Prisma.sql`WHERE sp."subscriptionId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND sp."status"::text = ${filter.status}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND sp."startsAt" >= (SELECT "startsAt" FROM "SubscriptionPeriod" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND sp."startsAt" <= (SELECT "startsAt" FROM "SubscriptionPeriod" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY sp."startsAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const periods = await this.db.$queryRaw<SubscriptionPeriod[]>`${query}`;
		const map: Map<string, SubscriptionPeriod[]> = new Map();
		for (const period of periods) {
			let subPeriods = map.get(period.subscriptionId);
			if (!subPeriods) {
				subPeriods = [];
				map.set(period.subscriptionId, subPeriods);
			}
			subPeriods.push(period);
		}
		for (const [subId, _, take] of ids) {
			if (take < 0) {
				map.get(subId)?.reverse();
			}
		}
		return map;
	}

	async updateLabel(id: string, label: string) {
		return this.db.subscription.update({
			where: {
				id,
			},
			data: {
				label,
			},
		});
	}

	async updatePeriodTimestamps(periodId: string, startsAt: Date, endsAt: Date) {
		return this.db.subscriptionPeriod.update({
			where: {
				id: periodId,
			},
			data: {
				startsAt,
				endsAt,
			},
		});
	}

	async markActive(id: string) {
		const sub = await this.db.subscription.update({
			where: {
				id,
			},
			data: {
				status: SubscriptionStatus.ACTIVE,
				activatedAt: new Date(),
			},
		});

		this.events.emit(SUBSCRIPTION_EVENT_ACTIVATED, sub);

		return sub;
	}

	async markSuspended(id: string) {
		const sub = await this.db.subscription.update({
			where: {
				id,
			},
			data: {
				status: SubscriptionStatus.SUSPENDED,
			},
		});

		this.events.emit(SUBSCRIPTION_EVENT_SUSPENDED, sub);

		return sub;
	}

	async cancel(id: string) {
		const sub = await this.db.subscription.update({
			where: {
				id,
				status: SubscriptionStatus.ACTIVE,
			},
			data: {
				status: SubscriptionStatus.CANCELLED,
				canceledAt: new Date(),
			},
			include: {
				periods: {
					where: {
						startsAt: { gt: new Date() },
						status: SubscriptionPeriodStatus.PENDING,
					},
					include: {
						ordersRenewPlan: {
							where: {
								order: {
									status: {
										in: [...PENDING_STATI],
									},
								},
							},
						},
					},
				},
			},
		});

		this.events.emit(SUBSCRIPTION_EVENT_CANCELLED, sub);

		for (const period of sub.periods) {
			for (const details of period.ordersRenewPlan) {
				await this.orderService.abort(details.orderId);
			}

			await this.db.subscriptionPeriod.update({
				where: {
					id: period.id,
				},
				data: {
					status: SubscriptionPeriodStatus.CANCELLED,
				},
			});
		}

		return sub;
	}

	async uncancel(id: string) {
		const sub = await this.db.subscription.update({
			where: {
				id,
				status: SubscriptionStatus.CANCELLED,
			},
			data: {
				status: SubscriptionStatus.ACTIVE,
				canceledAt: null,
				periods: {
					updateMany: {
						where: {
							subscriptionId: id,
							status: SubscriptionPeriodStatus.CANCELLED,
							startsAt: {
								gt: new Date(),
							},
						},
						data: {
							status: SubscriptionPeriodStatus.PENDING,
						},
					},
				},
			},
			include: {
				offer: true,
				periods: {
					where: {
						status: SubscriptionPeriodStatus.PENDING,
					},
				},
			},
		});

		for (const period of sub.periods) {
			await this.orderService.createRenewPlan({
				userId: sub.userId,
				offerId: sub.offerId,
				subId: sub.id,
				subPeriodId: period.id,
			});
		}

		this.events.emit(SUBSCRIPTION_EVENT_UNCANCELLED, sub);

		return sub;
	}

	async reactivate(id: string) {
		const sub = await this.db.subscription.update({
			where: {
				id,
				status: {
					in: [
						SubscriptionStatus.PENDING,
						SubscriptionStatus.CANCELLED,
						SubscriptionStatus.SUSPENDED,
						SubscriptionStatus.DEACTIVATED,
					],
				},
			},
			data: {
				status: SubscriptionStatus.ACTIVE,
				canceledAt: null,
				suspendedAt: null,
				deactivatedAt: null,
				periods: {
					updateMany: {
						where: {
							subscriptionId: id,
							status: SubscriptionPeriodStatus.CANCELLED,
							startsAt: {
								gt: new Date(),
							},
						},
						data: {
							status: SubscriptionPeriodStatus.PENDING,
						},
					},
				},
			},
			include: {
				offer: true,
				periods: {
					where: {
						status: SubscriptionPeriodStatus.PENDING,
					},
				},
			},
		});

		for (const period of sub.periods) {
			await this.orderService.createRenewPlan({
				userId: sub.userId,
				offerId: sub.offerId,
				subId: sub.id,
				subPeriodId: period.id,
			});
		}

		this.events.emit(SUBSCRIPTION_EVENT_REACTIVATED, sub);

		return sub;
	}

	async suspend(id: string) {
		const sub = await this.db.subscription.update({
			where: {
				id,
			},
			data: {
				status: SubscriptionStatus.SUSPENDED,
				suspendedAt: new Date(),
			},
			include: {
				periods: {
					where: {
						startsAt: { gt: new Date() },
						status: SubscriptionPeriodStatus.PENDING,
					},
					include: {
						ordersRenewPlan: {
							where: {
								order: {
									status: {
										notIn: [...FINAL_STATI],
									},
								},
							},
							include: {
								order: true,
							},
						},
					},
				},
			},
		});

		this.events.emit(SUBSCRIPTION_EVENT_SUSPENDED, sub);

		for (const period of sub.periods) {
			for (const details of period.ordersRenewPlan) {
				await this.orderService.abort(details.orderId);
			}

			await this.db.subscriptionPeriod.update({
				where: {
					id: period.id,
				},
				data: {
					status: SubscriptionPeriodStatus.CANCELLED,
				},
			});
		}

		return sub;
	}

	async deactivate(id: string) {
		const sub = await this.db.subscription.update({
			where: {
				id: id,
			},
			data: {
				status: SubscriptionStatus.DEACTIVATED,
				deactivatedAt: new Date(),
				currentPeriodId: null,
			},
			include: {
				periods: {
					where: {
						startsAt: { gt: new Date() },
						status: SubscriptionPeriodStatus.PENDING,
					},
					include: {
						ordersRenewPlan: {
							where: {
								order: {
									status: {
										notIn: [...FINAL_STATI],
									},
								},
							},
							include: {
								order: true,
							},
						},
					},
				},
			},
		});

		await this.orderService.createDeactivatePlan({
			userId: sub.userId,
			subId: sub.id,
		});

		this.events.emit(SUBSCRIPTION_EVENT_DEACTIVATED, sub);

		for (const period of sub.periods) {
			for (const details of period.ordersRenewPlan) {
				await this.orderService.abort(details.orderId);
			}

			await this.db.subscriptionPeriod.update({
				where: {
					id: period.id,
				},
				data: {
					status: SubscriptionPeriodStatus.CANCELLED,
				},
			});
		}

		return sub;
	}

	async create(dto: CreateSubscriptionDto) {
		const offer = await this.offerService.findOne(dto.offerId);
		const plan = await this.planService.findOne(offer.planId);

		const start = dto.start ?? new Date();
		const end = add(start, { seconds: plan.validForSeconds });

		const sub = await this.db.$transaction(async (tx) => {
			const sub = await tx.subscription.create({
				data: {
					userId: dto.userId,
					status: dto.status ?? SubscriptionStatus.PENDING,
					parentId: dto.parentId,
					telcoEdge: plan.telcoEdge,
					telcoOffset: plan.telcoOffset,
					billingEdge: plan.billingEdge,
					billingOffset: plan.billingOffset,
					offerId: dto.offerId,
					orders: dto.orderId ? { connect: { id: dto.orderId } } : undefined,
				},
			});

			await tx.subscriptionPeriod.create({
				data: {
					status: SubscriptionPeriodStatus.PENDING,
					// The following line connects the subscription period to the order details
					ordersAddPlan: dto.orderId
						? { connect: { orderId: dto.orderId } }
						: undefined,
					offerId: dto.offerId,
					startsAt: start,
					endsAt: end,
					subscriptionId: sub.id,
					currentSubscription: {
						connect: {
							id: sub.id,
						},
					},
				},
			});

			return tx.subscription.findUniqueOrThrow({
				where: {
					id: sub.id,
				},
			});
		});

		if (dto.iccid) {
			await this.simService.attachToSubscription(
				sub.id,
				dto.simType ?? SimType.E_SIM, // TODO: This probably shouldn't be a default
				dto.iccid,
			);
		}

		if (dto.msisdn) {
			await this.phoneNumService.attachToSubscription(
				sub.id,
				false,
				dto.msisdn,
			);
		}

		this.events.emit(SUBSCRIPTION_EVENT_CREATED, sub);

		return sub;
	}

	async rerunPeriod(id: string, periodId: string) {
		const period = await this.db.subscriptionPeriod.findUnique({
			where: {
				id: periodId,
				subscriptionId: id,
			},
			include: {
				subscription: true,
				ordersRenewPlan: {
					take: 1,
					orderBy: [{ order: { confirmedAt: 'desc' } }],
					include: {
						order: true,
					},
				},
				offer: true,
			},
		});

		if (!period) {
			throw new NotFoundException('period_not_found');
		}

		this.logger.log(
			`Rerunning period ${period.id} for sub ${period.subscriptionId}`,
		);

		const order = period.ordersRenewPlan[0]?.order;
		if (order) {
			if (!FINAL_STATI.has(order.status)) {
				await this.orderService.retry(order.id);
				return period;
			}
		}

		// TODO: Instead of extracting all these arguments from sub, just pass the sub?
		await this.orderService.createRenewPlan({
			userId: period.subscription.userId,
			offerId: period.offer.id,
			subId: period.subscriptionId,
			subPeriodId: period.id,
		});

		return this.db.subscriptionPeriod.update({
			where: {
				id: periodId,
				subscriptionId: id,
			},
			data: {
				status: SubscriptionPeriodStatus.PENDING,
			},
		});
	}

	async changeOffer(id: string, offerId: string) {
		const now = new Date();

		const sub = await this.db.subscription.update({
			where: {
				id,
			},
			data: {
				offerId,
				periods: {
					updateMany: {
						where: {
							status: SubscriptionPeriodStatus.PENDING,
							startsAt: { gt: now },
						},
						data: {
							offerId,
						},
					},
				},
			},
			include: {
				periods: {
					where: {
						status: SubscriptionPeriodStatus.PENDING,
						startsAt: { gt: now },
					},
				},
			},
		});

		for (const period of sub.periods) {
			const orders = await this.db.order.findMany({
				where: {
					status: OrderStatus.PENDING,
					renewPlan: {
						subscriptionPeriodId: period.id,
					},
				},
				include: {
					renewPlan: true,
				},
			});
			await this.db.orderRenewPlanDetails.updateMany({
				where: {
					orderId: {
						in: orders.map((o) => o.id),
					},
				},
				data: {
					offerId,
				},
			});
		}

		return sub;
	}

	async changePeriodOffer(periodId: string, offerId: string) {
		return this.db.subscriptionPeriod.update({
			where: {
				id: periodId,
			},
			data: {
				offerId,
			},
		});
	}

	async markPeriodProcessing(periodId: string) {
		return this.db.subscriptionPeriod.update({
			where: {
				id: periodId,
			},
			data: {
				status: SubscriptionPeriodStatus.PROCESSING,
			},
		});
	}

	async markPeriodDone(periodId: string) {
		return this.db.subscriptionPeriod.update({
			where: {
				id: periodId,
			},
			data: {
				status: SubscriptionPeriodStatus.DONE,
			},
		});
	}

	async markPeriodFailed(periodId: string) {
		return this.db.subscriptionPeriod.update({
			where: {
				id: periodId,
			},
			data: {
				status: SubscriptionPeriodStatus.FAILED,
			},
		});
	}

	@Cron('*/10 * * * * *')
	protected async processRenewals(): Promise<void> {
		const newSub = await this.db.$transaction(async (tx: PrismaClient) => {
			const now = new Date();
			const sub = await tx.subscription.findFirst({
				where: {
					status: SubscriptionStatus.ACTIVE,
					offer: {
						plan: {
							doesAutoRenew: true,
						},
					},
					periods: {
						none: {
							startsAt: { gt: now },
						},
					},
				},
				include: {
					offer: {
						include: {
							plan: true,
						},
					},
					periods: {
						orderBy: {
							endsAt: 'desc',
						},
						take: 1,
					},
				},
			});

			if (!sub) {
				return;
			}

			if (sub.periods.length === 0) {
				this.logger.error(
					`Cannot renew subscription ${sub.id} with no periods`,
				);
				return;
			}

			const start = sub.periods[0].endsAt;
			const end = add(start, { seconds: sub.offer.plan.validForSeconds });

			return tx.subscription.update({
				where: {
					id: sub.id,
					periods: {
						none: {
							startsAt: start,
						},
					},
				},
				data: {
					periods: {
						create: {
							status: SubscriptionPeriodStatus.PENDING,
							startsAt: start,
							endsAt: end,
							offerId: sub.offerId,
						},
					},
				},
				include: {
					periods: {
						where: {
							startsAt: start,
						},
					},
				},
			});
		});

		if (!newSub) {
			return;
		}

		if (newSub.periods.length !== 1) {
			throw new InternalServerErrorException(
				`new_periods_dont_match:${newSub.periods.length}`,
			);
		}

		const period = newSub.periods[0];

		await this.orderService.createRenewPlan({
			userId: newSub.userId,
			offerId: newSub.offerId,
			subId: newSub.id,
			subPeriodId: period.id,
		});

		this.logger.log(
			`Generated future period ${period.id} for sub ${newSub.id}`,
		);
	}

	@Cron('*/10 * * * * *')
	protected async processPeriodChanges(): Promise<void> {
		const now = new Date();

		const subs = await this.db.subscription.findMany({
			where: {
				currentPeriod: {
					endsAt: {
						lt: now,
					},
				},
			},
			take: MAX_CONCURRENT_SUBS,
			include: {
				periods: {
					where: {
						startsAt: {
							lte: now,
						},
						endsAt: {
							gt: now,
						},
					},
					take: 1,
				},
			},
		});

		// TODO: This technically isn't concurrent yet, has room for improvement
		for (const sub of subs) {
			const nextPeriod = sub.periods[0];
			if (!nextPeriod) {
				// This transaction prevents multiple deactivations running at once
				const newSub = await this.db.subscription.update({
					where: {
						id: sub.id,
						status: sub.status, // optimistic update clause
					},
					data: {
						status: SubscriptionStatus.DEACTIVATED,
						currentPeriodId: null,
					},
				});

				await this.orderService.createDeactivatePlan({
					userId: sub.userId,
					subId: sub.id,
				});

				this.events.emit(SUBSCRIPTION_EVENT_DEACTIVATED, newSub);

				this.logger.log(`Deactivating expired subscription ${newSub.id}`);

				return;
			}

			await this.db.subscription.update({
				where: {
					id: sub.id,
				},
				data: {
					offerId: nextPeriod.offerId,
					currentPeriodId: nextPeriod.id,
				},
			});

			this.logger.debug(
				`Changed subscription period for sub ${sub.id} from ${sub.currentPeriodId} to ${nextPeriod.id}`,
			);
		}
	}

	@Cron('*/10 * * * * *')
	protected async processSubscriptionHistory(): Promise<void> {
		const subs = await this.db.subscription.findMany({
			where: {
				status: SubscriptionStatus.ACTIVE,
				parentId: null,
				history: {
					none: {
						timestamp: {
							gt: sub(new Date(), { seconds: INTERVAL }),
						},
					},
				},
			},
			include: {
				offer: {
					include: {
						plan: {
							include: {
								volumes: true,
							},
						},
					},
				},
				sim: true,
				children: {
					include: {
						offer: {
							include: {
								plan: {
									include: {
										volumes: true,
									},
								},
							},
						},
					},
				},
			},
		});

		for (const sub of subs) {
			this.trackSubHistory(sub);
		}
	}

	protected async trackSubHistory(
		subscription: SubscriptionWithVolumes & {
			children: SubscriptionWithVolumes[];
			offer: Offer;
			sim: Sim | null;
		},
	) {
		this.logger.debug(`Tracking history for ${subscription.id}`);

		const histories = await this.db.$transaction(async (tx: PrismaClient) => {
			const ts = new Date();

			const history = await tx.subscriptionHistory.create({
				data: {
					subscriptionId: subscription.id,
					timestamp: ts,
					simIccid: subscription.simIccid,
					phoneNumberMsisdn: subscription.phoneNumberMsisdn,
				},
			});

			const num = await tx.subscriptionHistory.count({
				where: {
					timestamp: {
						gt: sub(ts, { seconds: INTERVAL }),
					},
				},
			});

			if (num > 1) {
				throw new InternalServerErrorException('multiple_sub_history');
			}

			const childHistories = await tx.subscriptionHistory.createManyAndReturn({
				data: subscription.children.map((child) => ({
					subscriptionId: child.id,
					timestamp: ts,
				})),
			});

			const historyMap: Map<string, SubscriptionHistory> = new Map();
			historyMap.set(subscription.id, history);
			for (const childHistory of childHistories) {
				historyMap.set(childHistory.subscriptionId, childHistory);
			}
			return historyMap;
		});

		const configs = await this.telcoService.getSubscriptionConfig(
			subscription,
			subscription.children,
		);
		await this.db.subscriptionHistoryTelcoData.createMany({
			data: configs.map(({ config, subscriptionId }) => ({
				subscriptionHistoryId: histories.get(subscriptionId)!.id,
				provider: this.telcoService.provider,
				data: config,
			})),
		});

		if (subscription.simIccid && subscription.phoneNumberMsisdn) {
			const usage = await this.telcoService.getSubscriptionUsage(
				subscription,
				subscription.children,
			);

			const subs = [subscription, ...subscription.children];
			for (const s of subs) {
				const prevHistory = await this.db.subscriptionHistory.findFirst({
					where: {
						subscriptionId: s.id,
						timestamp: {
							lt: histories.get(s.id)!.timestamp,
						},
					},
					orderBy: [
						{
							timestamp: 'desc',
						},
					],
					take: 1,
					include: {
						usage: true,
					},
				});

				await this.db.subscriptionHistory.update({
					where: {
						id: histories.get(s.id)!.id,
					},
					data: {
						usage: {
							create: usage
								.filter((u) => u.subscriptionId === s.id)
								.map((u) => ({
									type: u.type,
									isRoaming: u.isRoaming,
									isUnlimited: u.isUnlimited,
									amount: u.amountUsed.sub(
										prevHistory?.usage.find(
											(prevU) =>
												prevU.type === u.type &&
												prevU.isRoaming === u.isRoaming,
										)?.amount ?? 0,
									),
									total: u.amountTotal,
								})),
						},
					},
				});
			}
		}
	}
}

import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import {
	AddressType,
	Order,
	OrderAction,
	OrderAddPlanDetails,
	OrderChangePhoneNumberDetails,
	OrderChangePlanDetails,
	OrderChangeSimDetails,
	OrderPortOutDetails,
	OrderRenewPlanDetails,
	OrderRunStatus,
	OrderRunStepStatus,
	OrderStatus,
	OrderStepStatus,
	OrderType,
	Prisma,
	PrismaClient,
	SimStatus,
} from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { add, sub } from 'date-fns';

import { serializeError } from '@/util';
import { createFindQuery } from '@/queries';
import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { AddressService } from '@/address/address.service';
import { BillingService } from '@/billing/billing.service';
import { DbService } from '@/db/db.service';
import { SubscriptionService } from '@/subscription/subscription.service';
import { EventsService } from '@/events/events.service';
import { OfferService } from '@/offer/offer.service';
import { SimService } from '@/sim/sim.service';
import { SettingsService } from '@/settings/settings.service';
import { PromoCodeService } from '@/promo-code/promo-code.service';

import { CreateRenewPlanDto } from './dto/internal/create-renew-plan.dto';
import { CreateChangePlanDto } from './dto/internal/create-change-plan.dto';
import { CreateDeactivatePlanDto } from './dto/internal/create-deactivate-plan.dto';
import { CreateChangeSimDto } from './dto/internal/create-change-sim.dto';
import { CreateAddPlanDto } from './dto/internal/create-add-plan.dto';
import { UpdateDraftOrderDto } from './dto/internal/update-order.dto';
import { OrderFilterDto } from './dto/request/order-filter.dto';
import { CreateChangePhoneNumberDto } from './dto/internal/create-change-phone-number.dto';
import { CreatePortOutDto } from './dto/internal/create-port-out.dto';
import { OrderProcessor } from './order.processor';
import { OrderAddPlanProcessor } from './processors/add-plan.processor';
import { OrderRenewPlanProcessor } from './processors/renew-plan.processor';
import { OrderChangePlanProcessor } from './processors/change-plan.processor';
import { OrderChangeSimProcessor } from './processors/change-sim.processor';
import { OrderChangePhoneNumberProcessor } from './processors/change-phone-number.processor';
import { OrderDeactivatePlanProcessor } from './processors/deactivate-plan.processor';
import { OrderPortOutProcessor } from './processors/port-out.processor';
import {
	OrderOrderByColumn,
	OrderOrderByDto,
} from './dto/request/order-order-by.dto';
import {
	ORDER_EVENT_ABORTED,
	ORDER_EVENT_COMPLETED,
	ORDER_EVENT_CONFIRMED,
	ORDER_EVENT_CREATED,
	ORDER_EVENT_ERRORED,
} from './order.events';

export const MAX_CONCURRENT_ORDERS = 4;

export const PENDING_STATI: Set<OrderStatus> = new Set([
	OrderStatus.DRAFT,
	OrderStatus.CONFIRMED,
	OrderStatus.PENDING,
	OrderStatus.PROCESSING,
	OrderStatus.ERROR,
]);
export const FINAL_STATI: Set<OrderStatus> = new Set([
	OrderStatus.DONE,
	OrderStatus.ABORTED,
]);

const DEFAULT_ORDER_BY: OrderOrderByDto[] = [
	{ col: OrderOrderByColumn.updatedAt, dir: Prisma.SortOrder.desc },
];

@Injectable()
export class OrderService {
	protected readonly logger = new Logger(OrderService.name);
	protected readonly processors: Partial<Record<OrderType, OrderProcessor>> = {
		[OrderType.ADD_PLAN]: this.addPlanProcessor,
		[OrderType.RENEW_PLAN]: this.renewPlanProcessor,
		[OrderType.CHANGE_PLAN]: this.changePlanProcessor,
		[OrderType.CHANGE_SIM]: this.changeSimProcessor,
		[OrderType.CHANGE_PHONE_NUMBER]: this.changePhoneNumProcessor,
		[OrderType.DEACTIVATE_PLAN]: this.deactivatePlanProcessor,
		[OrderType.PORT_OUT]: this.portOutProcessor,
	};

	constructor(
		private readonly db: DbService,
		private readonly addrService: AddressService,
		private readonly billingService: BillingService,
		private readonly events: EventsService,
		private readonly settingsService: SettingsService,
		@Inject(forwardRef(() => SubscriptionService))
		private readonly subService: SubscriptionService,
		@Inject(forwardRef(() => OfferService))
		private readonly offerService: OfferService,
		@Inject(forwardRef(() => PromoCodeService))
		private readonly promoService: PromoCodeService,
		@Inject(forwardRef(() => SimService))
		private readonly simService: SimService,
		private readonly addPlanProcessor: OrderAddPlanProcessor,
		private readonly renewPlanProcessor: OrderRenewPlanProcessor,
		private readonly changePlanProcessor: OrderChangePlanProcessor,
		private readonly changeSimProcessor: OrderChangeSimProcessor,
		private readonly changePhoneNumProcessor: OrderChangePhoneNumberProcessor,
		private readonly deactivatePlanProcessor: OrderDeactivatePlanProcessor,
		private readonly portOutProcessor: OrderPortOutProcessor,
	) {}

	async findAll(
		filter?: OrderFilterDto,
		orderBy?: OrderOrderByDto[],
		args?: PaginationArgs,
	) {
		return paginate(
			async (take, skip, cursor) => {
				const query = createFindQuery(
					'Order',
					(joins, wheres) => {
						if (filter) {
							if (filter.type) {
								wheres.push(Prisma.sql`t."type"::text = ${filter.type}`);
							}
							if (filter.status) {
								wheres.push(Prisma.sql`t."status"::text = ${filter.status}`);
							}
							if (filter.step) {
								wheres.push(Prisma.sql`t."stepNo" = ${filter.step}`);
							}
							if (filter.stepType) {
								joins.push(
									Prisma.sql`LEFT JOIN "OrderStep" os ON os."orderId" = t."id" AND os."stepNo" = t."stepNo"`,
								);
								wheres.push(Prisma.sql`os."type" = ${filter.stepType}`);
							}
							if (filter.email) {
								joins.push(Prisma.sql`LEFT JOIN "User" u ON u.id = t."userId"`);
								wheres.push(
									Prisma.sql`u."email" ILIKE ${'%' + filter.email + '%'}`,
								);
							}
						}
					},
					(orderBy ?? []).concat(DEFAULT_ORDER_BY),
					take,
					skip,
					cursor,
				);

				const items = await this.db.$queryRaw<Order[]>`${query}`;
				if (take < 0) {
					items.reverse();
				}
				return items;
			},
			(item) => item.id,
			args,
		);
	}

	async findOne(id: string) {
		const order = await this.db.order.findUnique({
			where: {
				id,
			},
		});
		if (!order) {
			throw new NotFoundException('order_not_found');
		}
		return order;
	}

	async findByUserWithOffer(
		userId: string,
		types?: OrderType[],
		status?: OrderStatus[],
	) {
		return this.db.order.findMany({
			where: {
				userId,
				type: types ? { in: types } : undefined,
				status: status ? { in: status } : undefined,
			},
			orderBy: [
				{
					createdAt: 'desc',
				},
			],
			include: {
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
			},
		});
	}

	async findByUser(
		userId: string,
		types?: OrderType[],
		status?: OrderStatus[],
		stepNo?: number,
	) {
		return this.db.order.findMany({
			where: {
				userId,
				type: types ? { in: types } : undefined,
				status: status ? { in: status } : undefined,
				stepNo: stepNo,
			},
			orderBy: [
				{
					createdAt: 'desc',
				},
			],
		});
	}

	async findBySubscriptionWithOffer(
		subscriptionId: string,
		types?: OrderType[],
		status?: OrderStatus[],
	) {
		return this.db.order.findMany({
			where: {
				type: types ? { in: types } : undefined,
				status: status ? { in: status } : undefined,
				subscriptionId,
			},
			orderBy: [
				{
					createdAt: 'desc',
				},
			],
			include: {
				currentStep: true,
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
			},
		});
	}

	async findBySubscriptionWithDetails(
		subscriptionId: string,
		types?: OrderType[],
		status?: OrderStatus[],
	) {
		return this.db.order.findMany({
			where: {
				type: types ? { in: types } : undefined,
				status: status ? { in: status } : undefined,
				subscriptionId,
			},
			orderBy: [
				{
					createdAt: 'desc',
				},
			],
			include: {
				addPlan: true,
				renewPlan: true,
				deactivatePlan: true,
				changeSim: true,
				changePhoneNumber: true,
				portOut: true,
			},
		});
	}

	async findOneForUserWithOffer(id: string, userId: string) {
		const order = await this.db.order.findUnique({
			where: {
				id,
				userId,
			},
			include: {
				currentStep: true,
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
				changePlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
			},
		});
		if (!order) {
			throw new NotFoundException('order_not_found');
		}
		return order;
	}

	async findOneForUserWithDetails(id: string, userId: string) {
		const order = await this.db.order.findUnique({
			where: {
				id,
				userId,
			},
			include: {
				subscription: true,
				currentStep: true,
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
				changePlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
				signing: true,
			},
		});
		if (!order) {
			throw new NotFoundException('order_not_found');
		}

		return order;
	}

	async mapByIds(ids: string[]) {
		const orders = await this.db.order.findMany({
			where: {
				id: { in: ids },
			},
		});
		const map: Map<string, Order> = new Map();
		for (const order of orders) {
			map.set(order.id, order);
		}
		return map;
	}

	async mapByRunIds(runIds: string[]) {
		const runs = await this.db.orderRun.findMany({
			where: {
				id: { in: runIds },
			},
			include: {
				order: true,
			},
		});
		const map: Map<string, Order> = new Map();
		for (const run of runs) {
			map.set(run.id, run.order);
		}
		return map;
	}

	async mapByUserIdsPaginated(ids: PaginatedLoad<string, OrderFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT o.* FROM "Order" AS o `;
			let where = Prisma.sql`WHERE o."userId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.type) {
					where = Prisma.sql`${where} AND o."type"::text = ${filter.type}`;
				}
				if (filter.status) {
					where = Prisma.sql`${where} AND o."status"::text = ${filter.status}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND o."updatedAt" >= (SELECT "updatedAt" FROM "Order" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND o."updatedAt" <= (SELECT "updatedAt" FROM "Order" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY o."updatedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}
		const orders = await this.db.$queryRaw<Order[]>`${query}`;

		const map: Map<string, Order[]> = new Map();
		for (const order of orders) {
			let subOrders = map.get(order.userId);
			if (!subOrders) {
				subOrders = [];
				map.set(order.userId, subOrders);
			}
			subOrders.push(order);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapBySubIdsPaginated(ids: PaginatedLoad<string, OrderFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT o.* FROM "Order" AS o `;
			let where = Prisma.sql`WHERE o."subscriptionId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.type) {
					where = Prisma.sql`${where} AND o."type"::text = ${filter.type}`;
				}
				if (filter.status) {
					where = Prisma.sql`${where} AND o."status"::text = ${filter.status}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND o."updatedAt" >= (SELECT "updatedAt" FROM "Order" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND o."updatedAt" <= (SELECT "updatedAt" FROM "Order" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY o."updatedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}
		const orders = await this.db.$queryRaw<Order[]>`${query}`;

		const map: Map<string, Order[]> = new Map();
		for (const order of orders) {
			if (!order.subscriptionId) {
				continue;
			}

			let subOrders = map.get(order.subscriptionId);
			if (!subOrders) {
				subOrders = [];
				map.set(order.subscriptionId, subOrders);
			}
			subOrders.push(order);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapBySubPeriodIdsPaginated(
		ids: PaginatedLoad<string, OrderFilterDto>[],
	) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT o.*, COALESCE(oapd."subscriptionPeriodId", orpd."subscriptionPeriodId") as "subscriptionPeriodId" FROM "Order" AS o `;
			let where = Prisma.sql`
				WHERE oapd."subscriptionPeriodId" = ${id}::uuid
				OR orpd."subscriptionPeriodId" = ${id}::uuid
			`;
			let join = Prisma.sql`
				LEFT JOIN "OrderAddPlanDetails" AS oapd ON oapd."orderId" = o.id
				LEFT JOIN "OrderRenewPlanDetails" AS orpd ON orpd."orderId" = o.id
			`;
			if (filter) {
				if (filter.type) {
					where = Prisma.sql`${where} AND o."type"::text = ${filter.type}`;
				}
				if (filter.status) {
					where = Prisma.sql`${where} AND o."status"::text = ${filter.status}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND o."updatedAt" >= (SELECT "updatedAt" FROM "Order" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND o."updatedAt" <= (SELECT "updatedAt" FROM "Order" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY o."updatedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}
		const orders = await this.db.$queryRaw<
			(Order & { subscriptionPeriodId: string })[]
		>`${query}`;

		const map: Map<string, Order[]> = new Map();
		for (const order of orders) {
			let subOrders = map.get(order.subscriptionPeriodId);
			if (!subOrders) {
				subOrders = [];
				map.set(order.subscriptionPeriodId, subOrders);
			}
			subOrders.push(order);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapAddPlanDetailsByOrderIds(ids: string[]) {
		const orders = await this.db.orderAddPlanDetails.findMany({
			where: {
				orderId: { in: ids },
			},
		});
		const map: Map<string, OrderAddPlanDetails> = new Map();
		for (const order of orders) {
			map.set(order.orderId, order);
		}
		return map;
	}

	async mapRenewPlanDetailsByOrderIds(ids: string[]) {
		const orders = await this.db.orderRenewPlanDetails.findMany({
			where: {
				orderId: { in: ids },
			},
		});
		const map: Map<string, OrderRenewPlanDetails> = new Map();
		for (const order of orders) {
			map.set(order.orderId, order);
		}
		return map;
	}

	async mapChangePlanDetailsByOrderIds(ids: string[]) {
		const orders = await this.db.orderChangePlanDetails.findMany({
			where: {
				orderId: { in: ids },
			},
		});
		const map: Map<string, OrderChangePlanDetails> = new Map();
		for (const order of orders) {
			map.set(order.orderId, order);
		}
		return map;
	}

	async mapChangeSimDetailsByOrderIds(ids: string[]) {
		const orders = await this.db.orderChangeSimDetails.findMany({
			where: {
				orderId: { in: ids },
			},
		});
		const map: Map<string, OrderChangeSimDetails> = new Map();
		for (const order of orders) {
			map.set(order.orderId, order);
		}
		return map;
	}

	async mapChangePhoneNumberDetailsByOrderIds(ids: string[]) {
		const orders = await this.db.orderChangePhoneNumberDetails.findMany({
			where: {
				orderId: { in: ids },
			},
		});
		const map: Map<string, OrderChangePhoneNumberDetails> = new Map();
		for (const order of orders) {
			map.set(order.orderId, order);
		}
		return map;
	}

	async mapPortOutDetailsByOrderIds(ids: string[]) {
		const orders = await this.db.orderPortOutDetails.findMany({
			where: {
				orderId: { in: ids },
			},
		});
		const map: Map<string, OrderPortOutDetails> = new Map();
		for (const order of orders) {
			map.set(order.orderId, order);
		}
		return map;
	}

	async createAddPlan(dto: CreateAddPlanDto) {
		const offer = await this.offerService.findOne(dto.offerId);

		const order = await this.db.order.create({
			data: {
				type: OrderType.ADD_PLAN,
				status: OrderStatus.DRAFT,
				action: OrderAction.RUN,
				userId: dto.userId,
				addPlan: {
					create: {
						offerId: offer.id,
						parentSubscriptionId: dto.parentSubId,
						promoCodeId: dto.promoCodeId,
					},
				},
			},
			include: {
				currentStep: true,
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
				changePlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
			},
		});

		this.events.emit(ORDER_EVENT_CREATED, order);

		return order;
	}

	async createRenewPlan(dto: CreateRenewPlanDto) {
		const order = await this.db.order.create({
			data: {
				type: OrderType.RENEW_PLAN,
				status: OrderStatus.CONFIRMED,
				action: OrderAction.RUN,
				userId: dto.userId,
				confirmedAt: new Date(),
				subscriptionId: dto.subId,
				renewPlan: {
					create: {
						offerId: dto.offerId,
						subscriptionPeriodId: dto.subPeriodId,
					},
				},
			},
		});

		this.events.emit(ORDER_EVENT_CREATED, order);
		this.events.emit(ORDER_EVENT_CONFIRMED, order);

		return order;
	}

	async createChangePlan(dto: CreateChangePlanDto) {
		const order = await this.db.order.create({
			data: {
				type: OrderType.CHANGE_PLAN,
				status: OrderStatus.DRAFT,
				action: OrderAction.RUN,
				userId: dto.userId,
				confirmedAt: new Date(),
				subscriptionId: dto.subscriptionId,
				changePlan: {
					create: {
						offerId: dto.offerId,
						promoCodeId: dto.promoCodeId,
					},
				},
			},
			include: {
				currentStep: true,
				addPlan: {
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
				changePlan: {
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

		this.events.emit(ORDER_EVENT_CREATED, order);
		this.events.emit(ORDER_EVENT_CONFIRMED, order);

		return order;
	}

	async createDeactivatePlan(dto: CreateDeactivatePlanDto) {
		const order = await this.db.order.create({
			data: {
				type: OrderType.DEACTIVATE_PLAN,
				status: OrderStatus.CONFIRMED,
				action: OrderAction.RUN,
				userId: dto.userId,
				confirmedAt: new Date(),
				subscriptionId: dto.subId,
				deactivatePlan: {
					create: {},
				},
			},
		});

		this.events.emit(ORDER_EVENT_CREATED, order);
		this.events.emit(ORDER_EVENT_CONFIRMED, order);

		return order;
	}

	async createChangeSim(dto: CreateChangeSimDto) {
		const sub = await this.subService.findOne(dto.subId);

		const order = await this.db.order.create({
			data: {
				type: OrderType.CHANGE_SIM,
				status: OrderStatus.CONFIRMED,
				action: OrderAction.RUN,
				userId: sub.userId,
				confirmedAt: new Date(),
				subscriptionId: dto.subId,
				changeSim: {
					create: {
						newSimType: dto.simType,
						newSimIccid: dto.iccid,
					},
				},
			},
		});

		this.events.emit(ORDER_EVENT_CREATED, order);
		this.events.emit(ORDER_EVENT_CONFIRMED, order);

		return order;
	}

	async createChangePhoneNumber(dto: CreateChangePhoneNumberDto) {
		const sub = await this.subService.findOne(dto.subId);

		const order = await this.db.order.create({
			data: {
				type: OrderType.CHANGE_PHONE_NUMBER,
				status: OrderStatus.CONFIRMED,
				action: OrderAction.RUN,
				userId: sub.userId,
				confirmedAt: new Date(),
				subscriptionId: dto.subId,
				changePhoneNumber: {
					create: {
						portIn: dto.isPortingIn ?? false,
						portInMsisdn: dto.msisdn,
						portInAccountNumber: dto.ospAccountNumber,
						portInPassword: dto.ospPassword,
						portInPostalCode: dto.ospPostalCode,
					},
				},
			},
		});

		this.events.emit(ORDER_EVENT_CREATED, order);
		this.events.emit(ORDER_EVENT_CONFIRMED, order);

		return order;
	}

	async createPortOut(dto: CreatePortOutDto) {
		const order = await this.db.order.create({
			data: {
				type: OrderType.PORT_OUT,
				status: OrderStatus.CONFIRMED,
				action: OrderAction.RUN,
				userId: dto.userId,
				subscriptionId: dto.subId,
				portOut: {
					create: {},
				},
			},
			include: {
				currentStep: true,
				addPlan: {
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
				changePlan: {
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

		this.events.emit(ORDER_EVENT_CREATED, order);
		this.events.emit(ORDER_EVENT_CONFIRMED, order);

		return order;
	}

	async updateAddPlanDraft(id: string, dto: UpdateDraftOrderDto) {
		const order = await this.db.order.findUnique({
			where: {
				id,
			},
		});
		if (!order) {
			throw new NotFoundException('order_not_found');
		}
		if (order.status !== OrderStatus.DRAFT) {
			throw new BadRequestException('order_not_in_draft');
		}
		if (order.type !== OrderType.ADD_PLAN) {
			throw new BadRequestException(`order_wrong_type:${order.type}`);
		}

		let offerId: string | undefined = undefined;
		let promoCodeId: string | null | undefined = undefined;
		if (dto.promoCodeId && dto.offerId) {
			const offer = await this.offerService.findOneWithPromoAndValid(
				dto.offerId,
				dto.promoCodeId,
			);
			offerId = offer.id;
			promoCodeId = dto.promoCodeId;
		} else if (dto.offerId) {
			const offer = await this.offerService.findOnePublicValid(dto.offerId);
			offerId = offer.id;
			promoCodeId = null;
		}

		if (dto.simSelection?.iccid) {
			const sim = await this.simService.findOne(dto.simSelection.iccid);
			if (sim.status !== SimStatus.AVAILABLE) {
				throw new BadRequestException('sim_not_available');
			}
		}

		return this.db.order.update({
			where: {
				id,
				status: OrderStatus.DRAFT,
			},
			data: {
				addPlan: {
					update: {
						offerId,
						promoCodeId,
						simType: dto.simSelection?.simType,
						simIccid: dto.simSelection?.iccid,
						portIn: dto.portIn ? dto.portIn.isPortingIn : undefined,
						portInMsisdn: dto.portIn ? dto.portIn.msisdn : undefined,
						portInAccountNumber: dto.portIn
							? dto.portIn.accountNumber
							: undefined,
						portInPassword: dto.portIn ? dto.portIn.password : undefined,
						portInPostalCode: dto.portIn ? dto.portIn.postalCode : undefined,
					},
				},
			},
			include: {
				currentStep: true,
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
				changePlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
			},
		});
	}

	async confirmAddPlanDraft(id: string) {
		const order = await this.db.order.findUnique({
			where: {
				id,
			},
			include: {
				user: true,
				addPlan: {
					include: {
						promoCode: true,
					},
				},
			},
		});

		if (!order) {
			throw new BadRequestException('order_not_found');
		}
		if (order.status !== OrderStatus.DRAFT) {
			throw new BadRequestException('order_not_in_draft');
		}

		// TODO: Might want to make this configurable as well
		const addresses = await this.addrService.findByUser(order.userId);
		if (!addresses.some((a) => a.type === AddressType.Billing)) {
			throw new BadRequestException('user_requires_billing_address');
		}

		// TODO: Might want to make this configurable as well
		await this.billingService.checkUserSetupComplete(order.userId);

		if (order.addPlan?.promoCode) {
			if (
				(order.addPlan.promoCode.receiverId &&
					order.addPlan.promoCode.receiverId !== order.userId) ||
				(order.addPlan.promoCode.receiverEmail &&
					order.addPlan.promoCode.receiverEmail.toLowerCase() !==
						order.user.email.toLowerCase())
			) {
				throw new BadRequestException('wrong_account_to_redeem_promo');
			}

			await this.promoService.activate(order.addPlan.promoCode.id, order.id);
		}

		const newOrder = await this.db.order.update({
			where: {
				id: order.id,
				status: OrderStatus.DRAFT,
			},
			data: {
				status: OrderStatus.CONFIRMED,
				confirmedAt: new Date(),
			},
			include: {
				currentStep: true,
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
				changePlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
			},
		});

		this.events.emit(ORDER_EVENT_CONFIRMED, newOrder);

		setTimeout(() => this.processConfirmedOrders(), 1000);

		return newOrder;
	}

	async abort(id: string) {
		let order = await this.findOne(id);

		if (FINAL_STATI.has(order.status)) {
			throw new BadRequestException(
				`cannot_abort_order_in_status:${order.status}`,
			);
		}

		// If the order doesn't have any steps yet, then just abort it directly
		if (
			order.status === OrderStatus.DRAFT ||
			order.status === OrderStatus.CONFIRMED
		) {
			return this.db.order.update({
				where: {
					id: order.id,
					status: order.status,
				},
				data: {
					action: OrderAction.ABORT,
					status: OrderStatus.ABORTED,
				},
			});
		}

		return this.processOrder(order, OrderAction.ABORT);
	}

	async retry(id: string) {
		const order = await this.db.order.findUnique({
			where: {
				id,
			},
		});
		if (!order) {
			throw new BadRequestException('order_not_found');
		}

		if (FINAL_STATI.has(order.status)) {
			throw new BadRequestException(
				`cannot_retry_order_in_status:${order.status}`,
			);
		}

		return this.db.order.update({
			where: {
				id,
			},
			data: {
				status: OrderStatus.PENDING,
				runAt: null,
				attempts: {
					set: 0,
				},
			},
		});
	}

	async updateAddPlanIccid(id: string, iccid: string) {
		await this.db.order.update({
			where: {
				id,
			},
			data: {
				addPlan: {
					update: {
						simIccid: iccid,
					},
				},
			},
		});
	}

	async markShippingComplete(id: string) {
		return this.db.order.update({
			where: {
				id,
			},
			data: {
				runAt: null,
				shipping: {
					update: {
						data: {
							shippedAt: new Date(),
						},
					},
				},
			},
		});
	}

	async updateSignSignature(id: string, signature: string) {
		return this.db.order.update({
			where: {
				id,
			},
			data: {
				runAt: null,
				signing: {
					update: {
						signature,
						signedAt: new Date(),
					},
				},
			},
			include: {
				subscription: true,
				currentStep: true,
				signing: true,
				addPlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
				changePlan: {
					include: {
						offer: {
							include: {
								plan: true,
							},
						},
					},
				},
			},
		});
	}

	@Cron('*/10 * * * * *')
	protected async processConfirmedOrders(): Promise<void> {
		const orders = await this.db.order.findMany({
			where: {
				status: OrderStatus.CONFIRMED,
			},
			take: MAX_CONCURRENT_ORDERS,
		});

		for (const order of orders) {
			this.logger.debug(`Starting confirmed order ${order.id}`);

			const processor = this.processors[order.type];
			if (!processor) {
				this.logger.error(`Missing order processor for ${order.type}`);
			}

			const steps = processor?.getSteps() ?? [];

			await this.db.order.update({
				where: {
					id: order.id,
					status: order.status, // Optimistic update check clause
				},
				data: {
					status: OrderStatus.PENDING,
					steps: {
						create: steps.map((s) => ({
							...s,
							status: OrderStepStatus.PENDING,
							action: order.action,
						})),
					},
				},
			});
		}
	}

	@Cron('*/10 * * * * *')
	protected async processPendingOrders(): Promise<void> {
		const pendingOrders = await this.db.order.findMany({
			where: {
				status: {
					in: [OrderStatus.PENDING, OrderStatus.ERROR],
				},
				OR: [{ runAt: { lt: new Date() } }, { runAt: null }],
			},
			take: MAX_CONCURRENT_ORDERS,
		});

		for (const pendingOrder of pendingOrders) {
			// Don't await the result because we want them to process in parallel
			// Error handling must be done within the 'processPendingOrder' function
			this.processOrder(pendingOrder, pendingOrder.action);
		}
	}

	@Cron('*/10 * * * * *')
	protected async processTimedOutOrders(): Promise<void> {
		const processingOrder = await this.db.order.findFirst({
			where: {
				status: OrderStatus.PROCESSING,
				updatedAt: {
					lt: sub(new Date(), { days: 1 }),
				},
			},
		});

		if (!processingOrder) {
			return;
		}

		console.warn(`Found timed out order ${processingOrder.id}`);

		// TODO: Automatically do something with timed-out orders
	}

	private async processOrder(pendingOrder: Order, action: OrderAction) {
		const start = performance.now();
		this.logger.debug(
			`Processing order ${pendingOrder.id} - ${pendingOrder.type}`,
		);

		const retries = await this.settingsService.getRetries();
		const retryInSeconds = retries[pendingOrder.attempts];
		const shouldRetry = typeof retryInSeconds === 'number';

		const processor = this.processors[pendingOrder.type];
		if (!processor) {
			throw new InternalServerErrorException(
				`missing_order_processor:${pendingOrder.type}`,
			);
		}

		let newOrder = pendingOrder;
		let runId: string | null = null;
		let status: OrderStatus = OrderStatus.DONE;
		try {
			const order = await this.db.order.update({
				where: {
					id: pendingOrder.id,
					status: pendingOrder.status, // optimistic update check clause
				},
				data: {
					status: OrderStatus.PROCESSING,
					startedAt: pendingOrder.startedAt ?? new Date(),
					attempts: pendingOrder.action === action ? { increment: 1 } : 0,
					action,
					steps: {
						updateMany: {
							where: {},
							data: {
								action,
							},
						},
					},
				},
				include: {
					steps: {
						orderBy: [{ stepNo: 'asc' }],
					},
					addPlan: true,
					renewPlan: true,
					changePlan: true,
					deactivatePlan: true,
					reactivatePlan: true,
					changeSim: true,
					changePhoneNumber: true,
					portOut: true,
				},
			});

			const run = await this.db.$transaction(async (tx) => {
				let run = await tx.orderRun.create({
					data: {
						orderId: order.id,
						action,
						status: OrderRunStatus.PROCESSING,
						steps: {
							create: order.steps.map((s) => ({
								stepNo: s.stepNo,
								type: s.type,
								action,
								orderId: order.id,
								status: OrderRunStepStatus.PENDING,
							})),
						},
					},
				});
				if (typeof order.stepNo === 'number') {
					run = await tx.orderRun.update({
						where: {
							id: run.id,
						},
						data: {
							stepNo: order.stepNo,
						},
					});
				}
				return run;
			});

			runId = run.id;

			let status: OrderStatus;
			let runAt: Date | null;

			try {
				// This does the actual order processing using the specificied processor
				const res = await processor.process(order, order.steps, run);

				// Update the run to reflect that we're done processing
				await this.db.orderRun.update({
					where: {
						id: run.id,
					},
					data: {
						status: OrderRunStatus.DONE,
						completedAt: new Date(),
						result: res,
						steps: {
							updateMany: {
								where: {
									status: OrderRunStepStatus.PENDING,
								},
								data: {
									status: OrderRunStepStatus.SKIPPED,
								},
							},
						},
					},
				});

				if (res && 'runAt' in res) {
					status = OrderStatus.PENDING;
					runAt = res.runAt;
				} else {
					status =
						action === OrderAction.RUN ? OrderStatus.DONE : OrderStatus.ABORTED;
					runAt = null;
				}
			} catch (err) {
				this.logger.warn(`Run ${run.id} failed:`);
				this.logger.warn(err);

				const error = serializeError(err);

				// Update the step to reflect that we failed processing
				await this.db.orderStep.updateMany({
					where: {
						orderId: order.id,
						status: OrderStepStatus.PROCESSING,
					},
					data: {
						status: OrderStepStatus.ERROR,
						completedAt: new Date(),
						error,
					},
				});

				// Update the run to reflect that we failed processing
				await this.db.orderRun.update({
					where: {
						id: run.id,
						status: run.status,
					},
					data: {
						status: OrderRunStatus.ERROR,
						completedAt: new Date(),
						error,
						steps: {
							updateMany: [
								{
									where: {
										runId: run.id,
										status: OrderRunStepStatus.PROCESSING,
									},
									data: {
										status: OrderRunStepStatus.ERROR,
										completedAt: new Date(),
										error,
									},
								},
								{
									where: {
										runId: run.id,
										status: OrderRunStepStatus.PENDING,
									},
									data: {
										status: OrderRunStepStatus.SKIPPED,
									},
								},
							],
						},
					},
				});

				if (shouldRetry) {
					status = OrderStatus.ERROR;
					runAt = add(new Date(), { seconds: retryInSeconds });
				} else {
					status = OrderStatus.ABORTED;
					runAt = null;
				}
			}

			const isDelayed = status === OrderStatus.PENDING;
			const isComplete = FINAL_STATI.has(status);

			newOrder = await this.db.order.update({
				where: {
					id: order.id,
					status: OrderStatus.PROCESSING, // optimistic update check clause
				},
				data: {
					status,
					runAt,
					completedAt: isComplete ? new Date() : undefined,
					attempts: isDelayed ? { decrement: 1 } : undefined,
					steps: isComplete
						? {
								updateMany: {
									where: {
										status: OrderStepStatus.PENDING,
									},
									data: {
										status: OrderStepStatus.SKIPPED,
									},
								},
							}
						: undefined,
				},
			});

			switch (status) {
				case OrderStatus.DONE: {
					this.events.emit(ORDER_EVENT_COMPLETED, newOrder);
					break;
				}

				case OrderStatus.ERROR: {
					this.events.emit(ORDER_EVENT_ERRORED, newOrder);
					break;
				}

				case OrderStatus.ABORTED: {
					this.events.emit(ORDER_EVENT_ABORTED, newOrder);
					break;
				}
			}

			return order;
		} catch (err) {
			this.logger.error(`Order processing failed for ${pendingOrder.id}`);
			this.logger.error(err);

			const error = serializeError(err);

			return this.db.order.update({
				where: {
					id: pendingOrder.id,
					status: OrderStatus.PROCESSING,
				},
				data: {
					status: shouldRetry ? OrderStatus.ERROR : OrderStatus.ABORTED,
					runAt: shouldRetry
						? add(new Date(), { seconds: retryInSeconds })
						: null,
					runs: runId
						? {
								update: {
									where: {
										id: runId,
										status: OrderRunStatus.PROCESSING,
									},
									data: {
										status: OrderRunStatus.ERROR,
										completedAt: new Date(),
										error,
										steps: {
											updateMany: [
												{
													where: {
														status: OrderRunStepStatus.PROCESSING,
													},
													data: {
														status: OrderRunStepStatus.ERROR,
														completedAt: new Date(),
														error,
													},
												},
												{
													where: {
														status: OrderRunStepStatus.PENDING,
													},
													data: {
														status: OrderRunStepStatus.SKIPPED,
													},
												},
											],
										},
									},
								},
							}
						: undefined,
				},
			});
		} finally {
			const diff = Math.round(performance.now() - start);
			this.logger.debug(
				`Processed order ${newOrder.id}: ${status} in ${diff}ms, run: ${runId}`,
			);
		}
	}
}

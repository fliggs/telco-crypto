import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import {
	Invoice,
	InvoiceItem,
	InvoiceStatus,
	Prisma,
	PrismaClient,
} from '@prisma/client';

import { shortId } from '@/util';
import { DbService } from '@/db/db.service';
import { DecimalNumber } from '@/decimal.dto';
import { paginate, PaginatedLoad, PaginationArgs } from '@/paginated';
import { BillingService } from '@/billing/billing.service';
import { TaxService } from '@/tax/tax.service';
import { CreditService } from '@/credit/credit.service';

import { InvoiceItemInputDto } from './dto/internal/invoice-item-input.dto';
import { InvoiceFilterDto } from './dto/request/invoice-filter.dto';
import {
	InvoiceOrderByColumn,
	InvoiceOrderByDto,
} from './dto/request/invoice-order-by.dto';

const DEFAULT_ORDER_BY: InvoiceOrderByDto[] = [
	{ col: InvoiceOrderByColumn.invoicedAt, dir: Prisma.SortOrder.desc },
];

@Injectable()
export class InvoiceService {
	protected readonly logger = new Logger(InvoiceService.name);

	constructor(
		private readonly db: DbService,
		private readonly billingService: BillingService,
		private readonly taxService: TaxService,
		private readonly creditService: CreditService,
	) {}

	async create(orderId: string, tx: PrismaClient) {
		return tx.invoice.create({
			data: {
				status: InvoiceStatus.PENDING,
				orderId: orderId,
				invoicedAt: new Date(),
				totalCost: '0.00',
			},
			include: {
				items: true,
			},
		});
	}

	async addItems(
		invoiceId: string,
		items: InvoiceItemInputDto[],
		tx: PrismaClient,
	) {
		const total = this.total(items);

		return tx.invoice.update({
			where: {
				id: invoiceId,
			},
			data: {
				totalCost: {
					increment: total,
				},
				items: {
					create: items,
				},
			},
		});
	}

	async findOne(id: string) {
		const invoice = await this.db.invoice.findUnique({
			where: {
				id,
			},
		});
		if (!invoice) {
			throw new NotFoundException('invoice_not_found');
		}
		return invoice;
	}

	async findAll(
		filter?: InvoiceFilterDto,
		orderBy?: InvoiceOrderByDto[],
		args?: PaginationArgs,
	) {
		return paginate(
			(take, skip, cursor) =>
				this.db.invoice.findMany({
					where: {
						...(filter?.status ? { status: filter.status } : null),
					},
					take,
					skip,
					cursor: cursor ? { id: cursor } : undefined,
					orderBy: (orderBy ?? [])
						.concat(DEFAULT_ORDER_BY)
						.map((o) => ({ [o.col]: o.dir })),
				}),
			(item) => item.id,
			args,
		);
	}

	async findByUserWithOrderAndItems(userId: string) {
		return this.db.invoice.findMany({
			where: {
				order: {
					userId,
				},
			},
			orderBy: [
				{
					invoicedAt: 'desc',
				},
			],
			include: {
				items: true,
				order: {
					include: {
						subscription: {
							include: {
								currentPeriod: true,
								offer: {
									include: {
										plan: true,
									},
								},
							},
						},
					},
				},
			},
		});
	}

	async findByOrderWithItems(orderId: string) {
		return this.db.invoice.findMany({
			where: {
				orderId,
			},
			include: {
				items: true,
			},
		});
	}

	async mapItemsByInvoiceIds(ids: string[]) {
		const items = await this.db.invoiceItem.findMany({
			where: {
				invoiceId: { in: ids },
			},
		});
		const map: Map<string, InvoiceItem[]> = new Map();
		for (const item of items) {
			let invoiceItems = map.get(item.invoiceId);
			if (!invoiceItems) {
				invoiceItems = [];
				map.set(item.invoiceId, invoiceItems);
			}
			invoiceItems.push(item);
		}
		return map;
	}

	async mapByUserIdsPaginated(ids: PaginatedLoad<string, InvoiceFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT i.*, o."userId" AS "userId" FROM "Invoice" AS i`;
			let where = Prisma.sql`WHERE o."userId" = ${id}::uuid`;
			let join = Prisma.sql`JOIN "Order" o ON o.id = i."orderId"`;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND i."status"::text = ${filter.status}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND i."invoicedAt" >= (SELECT "invoicedAt" FROM "Invoice" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND i."invoicedAt" <= (SELECT "invoicedAt" FROM "Invoice" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY i."invoicedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const invoices = await this.db.$queryRaw<
			(Invoice & { userId: string })[]
		>`${query}`;

		const map: Map<string, Invoice[]> = new Map();
		for (const invoice of invoices) {
			let userInvoices = map.get(invoice.userId);
			if (!userInvoices) {
				userInvoices = [];
				map.set(invoice.userId, userInvoices);
			}
			userInvoices.push(invoice);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapByOrderIdsPaginated(ids: PaginatedLoad<string, InvoiceFilterDto>[]) {
		let query = Prisma.sql``;

		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT i.* FROM "Invoice" AS i`;
			let where = Prisma.sql`WHERE i."orderId" = ${id}::uuid`;
			let join = Prisma.sql``;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND i."status"::text = ${filter.status}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND i."invoicedAt" >= (SELECT "invoicedAt" FROM "Invoice" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND i."invoicedAt" <= (SELECT "invoicedAt" FROM "Invoice" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY i."invoicedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const invoices = await this.db.$queryRaw<Invoice[]>`${query}`;

		const map: Map<string, Invoice[]> = new Map();
		for (const invoice of invoices) {
			if (!invoice.orderId) {
				continue;
			}

			let orderInvoices = map.get(invoice.orderId);
			if (!orderInvoices) {
				orderInvoices = [];
				map.set(invoice.orderId, orderInvoices);
			}
			orderInvoices.push(invoice);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async mapBySubscriptionIdsPaginated(
		ids: PaginatedLoad<string, InvoiceFilterDto>[],
	) {
		let query = Prisma.sql``;
		for (let i = 0; i < ids.length; i++) {
			const [id, filter, take, skip, cursor] = ids[i];
			const sel = Prisma.sql`SELECT i.*, o."subscriptionId" AS "subscriptionId" FROM "Invoice" AS i`;
			let where = Prisma.sql`WHERE o."subscriptionId" = ${id}::uuid`;
			let join = Prisma.sql`JOIN "Order" o ON o.id = i."orderId"`;
			if (filter) {
				if (filter.status) {
					where = Prisma.sql`${where} AND i."status"::text = ${filter.status}`;
				}
			}
			if (cursor) {
				if (take < 0) {
					where = Prisma.sql`${where} AND i."invoicedAt" >= (SELECT "invoicedAt" FROM "Invoice" WHERE "id" = ${cursor}::uuid)`;
				} else {
					where = Prisma.sql`${where} AND i."invoicedAt" <= (SELECT "invoicedAt" FROM "Invoice" WHERE "id" = ${cursor}::uuid)`;
				}
			}
			const order = Prisma.sql`ORDER BY i."invoicedAt" ${Prisma.raw(take < 0 ? 'ASC' : 'DESC')}`;
			const row = Prisma.sql`(${sel} ${join} ${where} ${order} LIMIT ${Math.abs(take)} OFFSET ${skip})`;
			query = i > 0 ? Prisma.sql`${query} UNION ALL ${row}` : row;
		}

		const invoices = await this.db.$queryRaw<
			(Invoice & { subscriptionId: string })[]
		>`${query}`;

		const map: Map<string, Invoice[]> = new Map();
		for (const invoice of invoices) {
			let subInvoices = map.get(invoice.subscriptionId);
			if (!subInvoices) {
				subInvoices = [];
				map.set(invoice.subscriptionId, subInvoices);
			}
			subInvoices.push(invoice);
		}
		for (const [id, _, take] of ids) {
			if (take < 0) {
				map.get(id)?.reverse();
			}
		}
		return map;
	}

	async markPaid(id: string) {
		return this.db.invoice.update({
			where: {
				id,
				status: InvoiceStatus.PENDING,
			},
			data: {
				status: InvoiceStatus.PAID,
				paidAt: new Date(),
			},
		});
	}

	async markVoid(id: string) {
		return this.db.invoice.update({
			where: {
				id,
				status: InvoiceStatus.PENDING,
			},
			data: {
				status: InvoiceStatus.VOID,
				paidAt: new Date(),
			},
		});
	}

	total(items: InvoiceItemInputDto[]) {
		return items.reduce(
			(total, item) => total.plus(item.totalCost),
			new DecimalNumber(0),
		);
	}

	async refund(id: string, asCredit: boolean) {
		const invoice = await this.db.invoice.findUnique({
			where: {
				id,
			},
			include: {
				order: {
					include: {
						addPlan: true,
						renewPlan: true,
					},
				},
				creditUsages: {
					include: {
						credit: true,
					},
				},
			},
		});
		if (!invoice) {
			throw new NotFoundException('invoice_not_found');
		}
		if (invoice.status !== InvoiceStatus.PAID) {
			throw new BadRequestException(`invalid_invoice_status:${invoice.status}`);
		}
		if (!invoice.orderId || !invoice.order) {
			throw new BadRequestException('invoice_has_no_order');
		}

		await this.taxService.refundedOrder(invoice.orderId);

		for (const usage of invoice.creditUsages) {
			await this.creditService.create({
				title:
					usage.credit.content.title ??
					`Credits from invoice ${shortId(invoice.id)}`,
				userId: invoice.order.userId,
				subscriptionId: invoice.order.subscriptionId,
				providedCost: usage.usedCost,
			});
		}

		if (asCredit) {
			if (invoice.totalCost.gt(0)) {
				// TODO: Allow customizing this title message format
				await this.creditService.create({
					title: `Credits from invoice ${shortId(invoice.id)}`,
					userId: invoice.order.userId,
					subscriptionId: invoice.order.subscriptionId,
					providedCost: invoice.totalCost,
				});
			}
		} else {
			await this.billingService.refund({
				invoice,
			});
		}

		return this.db.invoice.update({
			where: {
				id,
			},
			data: {
				status: InvoiceStatus.REFUNDED,
				refundedAt: new Date(),
			},
		});
	}

	async void(id: string) {
		const invoice = await this.db.invoice.findUnique({
			where: {
				id,
			},
		});
		if (!invoice) {
			throw new NotFoundException('invoice_not_found');
		}
		if (invoice.status !== InvoiceStatus.PENDING) {
			throw new BadRequestException(`invalid_invoice_status:${invoice.status}`);
		}

		await this.billingService.void({
			invoice,
		});

		return this.db.invoice.update({
			where: {
				id,
			},
			data: {
				status: InvoiceStatus.VOID,
				voidedAt: new Date(),
			},
		});
	}
}

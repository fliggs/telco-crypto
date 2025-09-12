import { Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Prisma, InvoiceStatus, OrderStatus } from '@prisma/client';
import { add, isAfter, isSameDay, sub } from 'date-fns';
import {
	DiskHealthIndicator,
	HealthCheckService,
	HttpHealthIndicator,
	MemoryHealthIndicator,
} from '@nestjs/terminus';

import { DbService } from '@/db/db.service';
import { DecimalNumber } from '@/decimal.dto';
import { AdminAccess } from '@/auth/access.decorator';
import { DbHealthIndicator } from '@/db/db.health';
import { MobileAppHealthIndicator } from '@/mobile-app/mobile-app.health';

import { HealthDto } from './dto/graphql/health.dto';
import {
	InvoiceHistoryStatDto,
	OrderHistoryStatDto,
	StatsDto,
	UserHistoryStatDto,
} from './dto/graphql/stats.dto';

@Resolver(() => StatsDto)
export class HealthResolver {
	constructor(
		private readonly db: DbService,
		private readonly healthSrv: HealthCheckService,
		private readonly http: HttpHealthIndicator,
		private readonly disk: DiskHealthIndicator,
		private readonly memory: MemoryHealthIndicator,
		private readonly dbHealth: DbHealthIndicator,
		private readonly app: MobileAppHealthIndicator,
	) {}

	@AdminAccess()
	@Query(() => HealthDto)
	async health(): Promise<HealthDto> {
		return (
			this.healthSrv
				.check([
					() => this.http.pingCheck('network', 'https://cloudflare.com'),
					() =>
						this.disk.checkStorage('storage', {
							path: '/',
							thresholdPercent: 0.95,
						}),
					() => this.memory.checkHeap('memory', 150 * 1024 * 1024),
					() => this.dbHealth.checkConnection('db'),
					() => this.app.checkVersion('mobileApp'),
				])
				// TODO: Check why this is needed: probably because of graphql error handling
				.catch((res) => res.response)
		);
	}

	@AdminAccess()
	@Query(() => StatsDto)
	async stats(): Promise<StatsDto> {
		return new StatsDto();
	}

	@AdminAccess()
	@ResolveField()
	async userHistory(): Promise<UserHistoryStatDto[]> {
		const usersPerDay = await this.db.$queryRaw<
			{ timestamp: string; groupName: string | null; count: string }[]
		>(Prisma.sql`
				SELECT
					date_trunc('day', "User"."createdAt") AS "timestamp",
					"UserGroup"."name" AS "groupName",
					COUNT(*) AS "count"
				FROM
					"User"
				LEFT JOIN
					"UserGroup" ON "UserGroup"."id" = "User"."groupId"
				WHERE
					"User"."createdAt" > NOW() - INTERVAL '1 MONTH'
				GROUP BY
					"timestamp",
					"UserGroup"."name"
		`);

		const now = new Date();
		let ts = sub(now, { months: 1 });
		const userHistory: {
			timestamp: Date;
			counts: { name: string; count: number }[];
		}[] = [];

		while (!isAfter(ts, now)) {
			const users = usersPerDay.filter(
				(h) => h.timestamp && isSameDay(h.timestamp, ts),
			);
			const counts: { name: string; count: number }[] = [];
			for (const user of users) {
				counts.push({
					name: user.groupName ?? '_',
					count: Number(user.count),
				});
			}
			userHistory.push({
				timestamp: ts,
				counts,
			});

			ts = add(ts, { days: 1 });
		}

		return userHistory;
	}

	@AdminAccess()
	@ResolveField()
	async invoiceHistory(): Promise<InvoiceHistoryStatDto[]> {
		const invoicesPerDay = await this.db.$queryRaw<
			{ timestamp: string; status: InvoiceStatus; count: number }[]
		>(
			Prisma.sql`
				SELECT
					date_trunc('day', "invoicedAt") AS "timestamp",
					"status" AS "status",
					COUNT(*) AS "count"
				FROM
					"Invoice"
				WHERE
					"invoicedAt" > NOW() - INTERVAL '1 MONTH'
				GROUP BY
					"timestamp",
					"status"
			`,
		);

		const now = new Date();
		let ts = sub(now, { months: 1 });
		const invoiceHistory: {
			timestamp: Date;
			counts: Record<InvoiceStatus, number>;
		}[] = [];

		while (!isAfter(ts, now)) {
			const invoiceCounts: Record<InvoiceStatus, number> = {
				[InvoiceStatus.PAID]: 0,
				[InvoiceStatus.PENDING]: 0,
				[InvoiceStatus.REFUNDED]: 0,
				[InvoiceStatus.VOID]: 0,
			};
			const invoices = invoicesPerDay.filter(
				(inv) => inv.timestamp && isSameDay(inv.timestamp, ts),
			);
			for (const invoice of invoices) {
				invoiceCounts[invoice.status] =
					(invoiceCounts[invoice.status] ?? 0) + Number(invoice.count);
			}

			invoiceHistory.push({
				timestamp: ts,
				counts: invoiceCounts,
			});

			ts = add(ts, { days: 1 });
		}

		return invoiceHistory;
	}

	@AdminAccess()
	@ResolveField()
	async orderHistory(): Promise<OrderHistoryStatDto[]> {
		const ordersPerDay = await this.db.$queryRaw<
			{ timestamp: string; status: OrderStatus; count: number }[]
		>(
			Prisma.sql`
				SELECT
					date_trunc('day', "confirmedAt") AS "timestamp",
					"status" AS "status",
					COUNT(*) AS "count"
				FROM
					"Order"
				WHERE
					"confirmedAt" > NOW() - INTERVAL '1 MONTH'
				GROUP BY
					"timestamp",
					"status"
			`,
		);

		const now = new Date();
		let ts = sub(now, { months: 1 });
		const orderHistory: {
			timestamp: Date;
			counts: Record<OrderStatus, number>;
		}[] = [];

		while (!isAfter(ts, now)) {
			const orderCounts: Record<OrderStatus, number> = {
				[OrderStatus.DRAFT]: 0,
				[OrderStatus.CONFIRMED]: 0,
				[OrderStatus.PENDING]: 0,
				[OrderStatus.PROCESSING]: 0,
				[OrderStatus.DONE]: 0,
				[OrderStatus.ERROR]: 0,
				[OrderStatus.ABORTED]: 0,
			};
			const orders = ordersPerDay.filter(
				(inv) => inv.timestamp && isSameDay(inv.timestamp, ts),
			);
			for (const order of orders) {
				orderCounts[order.status] =
					(orderCounts[order.status] ?? 0) + Number(order.count);
			}

			orderHistory.push({
				timestamp: ts,
				counts: orderCounts,
			});

			ts = add(ts, { days: 1 });
		}

		return orderHistory;
	}

	@AdminAccess()
	@ResolveField()
	async openInvoicesTotal() {
		const openInvoices = await this.db.invoice.aggregate({
			where: {
				status: InvoiceStatus.PENDING,
			},
			_sum: {
				totalCost: true,
			},
		});
		return openInvoices._sum.totalCost ?? new DecimalNumber(0);
	}

	@AdminAccess()
	@ResolveField()
	async orderCounts() {
		const ordersByStatus = await this.db.order.groupBy({
			by: ['status'],
			_count: true,
		});

		return Object.values(OrderStatus).reduce(
			(map, curr) => {
				map[curr] = ordersByStatus.find((s) => s.status === curr)?._count ?? 0;
				return map;
			},
			{} as Record<OrderStatus, number>,
		);
	}
}

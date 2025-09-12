import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import {
	Order,
	OrderAddPlanDetails,
	OrderChangePhoneNumberDetails,
	OrderChangePlanDetails,
	OrderChangeSimDetails,
	OrderPortOutDetails,
	OrderRenewPlanDetails,
} from '@prisma/client';

import { PaginatedLoad } from '@/paginated';

import { OrderService } from './order.service';
import { OrderFilterDto } from './dto/request/order-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class OrderLoader {
	constructor(private readonly orderService: OrderService) {}

	public readonly byId = new DataLoader<string, Order>(
		async (keys: readonly string[]) => {
			const map = await this.orderService.mapByIds([...keys]);
			return keys.map(
				(key) => map.get(key) ?? new NotFoundException('order_not_found'),
			);
		},
	);

	public readonly byRun = new DataLoader<string, Order>(
		async (keys: readonly string[]) => {
			const map = await this.orderService.mapByRunIds([...keys]);
			return keys.map(
				(key) => map.get(key) ?? new NotFoundException('order_not_found'),
			);
		},
	);

	public readonly bySubscriptionPaginated = new DataLoader<
		PaginatedLoad<string, OrderFilterDto>,
		Order[]
	>(async (keys: readonly PaginatedLoad<string, OrderFilterDto>[]) => {
		const map = await this.orderService.mapBySubIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly bySubscriptionPeriodPaginated = new DataLoader<
		PaginatedLoad<string, OrderFilterDto>,
		Order[]
	>(async (keys: readonly PaginatedLoad<string, OrderFilterDto>[]) => {
		const map = await this.orderService.mapBySubPeriodIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly byUserPaginated = new DataLoader<
		PaginatedLoad<string, OrderFilterDto>,
		Order[]
	>(async (keys: readonly PaginatedLoad<string, OrderFilterDto>[]) => {
		const map = await this.orderService.mapByUserIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly addPlanDetailsByOrderId = new DataLoader<
		string,
		OrderAddPlanDetails | null
	>(async (keys: readonly string[]) => {
		const map = await this.orderService.mapAddPlanDetailsByOrderIds([...keys]);
		return keys.map((key) => map.get(key) ?? null);
	});

	public readonly renewPlanDetailsByOrderId = new DataLoader<
		string,
		OrderRenewPlanDetails | null
	>(async (keys: readonly string[]) => {
		const map = await this.orderService.mapRenewPlanDetailsByOrderIds([
			...keys,
		]);
		return keys.map((key) => map.get(key) ?? null);
	});

	public readonly changePlanDetailsByOrderId = new DataLoader<
		string,
		OrderChangePlanDetails | null
	>(async (keys: readonly string[]) => {
		const map = await this.orderService.mapChangePlanDetailsByOrderIds([
			...keys,
		]);
		return keys.map((key) => map.get(key) ?? null);
	});

	public readonly changeSimDetailsByOrderId = new DataLoader<
		string,
		OrderChangeSimDetails | null
	>(async (keys: readonly string[]) => {
		const map = await this.orderService.mapChangeSimDetailsByOrderIds([
			...keys,
		]);
		return keys.map((key) => map.get(key) ?? null);
	});

	public readonly changePhoneNumberDetailsByOrderId = new DataLoader<
		string,
		OrderChangePhoneNumberDetails | null
	>(async (keys: readonly string[]) => {
		const map = await this.orderService.mapChangePhoneNumberDetailsByOrderIds([
			...keys,
		]);
		return keys.map((key) => map.get(key) ?? null);
	});

	public readonly portOutDetailsByOrderId = new DataLoader<
		string,
		OrderPortOutDetails | null
	>(async (keys: readonly string[]) => {
		const map = await this.orderService.mapPortOutDetailsByOrderIds([...keys]);
		return keys.map((key) => map.get(key) ?? null);
	});
}

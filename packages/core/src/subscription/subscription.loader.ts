import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import { Subscription, SubscriptionPeriod } from '@prisma/client';
import * as DataLoader from 'dataloader';

import { PaginatedLoad } from '@/paginated';

import { SubscriptionService } from './subscription.service';
import { SubscriptionFilterDto } from './dto/request/subscription-filter.dto';
import { SubscriptionPeriodFilterDto } from './dto/request/subscription-period-filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class SubscriptionLoader {
	constructor(private readonly subService: SubscriptionService) {}

	public readonly byUserPaginated = new DataLoader<
		PaginatedLoad<string, SubscriptionFilterDto>,
		Subscription[]
	>(async (keys: readonly PaginatedLoad<string, SubscriptionFilterDto>[]) => {
		const map = await this.subService.mapByUserIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly byCurrentSim = new DataLoader<string, Subscription | null>(
		async (keys: readonly string[]) => {
			const map = await this.subService.mapByCurrentSimIccid([...keys]);
			return keys.map((key) => map.get(key) ?? null);
		},
	);

	public readonly byCurrentPhoneNumber = new DataLoader<
		string,
		Subscription | null
	>(async (keys: readonly string[]) => {
		const map = await this.subService.mapByCurrentPhoneNumberMsisdn([...keys]);
		return keys.map((key) => map.get(key) ?? null);
	});

	public readonly childrenBySubscriptionPaginated = new DataLoader<
		PaginatedLoad<string, SubscriptionFilterDto>,
		Subscription[]
	>(async (keys: readonly PaginatedLoad<string, SubscriptionFilterDto>[]) => {
		const map = await this.subService.mapChildrenBySubscriptionIdsPaginated([
			...keys,
		]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly periodById = new DataLoader<string, SubscriptionPeriod>(
		async (keys: readonly string[]) => {
			const map = await this.subService.mapPeriodsById([...keys]);
			return keys.map(
				(key) => map.get(key) ?? new NotFoundException('sub_period_not_found'),
			);
		},
	);

	public readonly periodsbySubscriptionPaginated = new DataLoader<
		PaginatedLoad<string, SubscriptionPeriodFilterDto>,
		SubscriptionPeriod[]
	>(
		async (
			keys: readonly PaginatedLoad<string, SubscriptionPeriodFilterDto>[],
		) => {
			const map = await this.subService.mapPeriodsBySubscriptionIdsPaginated([
				...keys,
			]);
			return keys.map(([key]) => map.get(key) ?? []);
		},
	);
}

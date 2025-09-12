import { Injectable, NotFoundException, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { Offer } from '@prisma/client';

import { PaginatedLoad } from '@/paginated';

import { OfferService } from './offer.service';
import { OfferDto } from './dto/graphql/offer.dto';
import { OfferFilterDto } from './dto/request/filter.dto';

@Injectable({ scope: Scope.REQUEST })
export class OfferLoader {
	constructor(private readonly offerService: OfferService) {}

	public readonly byId = new DataLoader<string, OfferDto>(
		async (keys: readonly string[]) => {
			const map = await this.offerService.mapByIds([...keys]);
			return keys.map(
				(key) => map.get(key) ?? new NotFoundException('offer_not_found'),
			);
		},
	);

	public readonly byPromoCodePaginated = new DataLoader<
		PaginatedLoad<string, OfferFilterDto>,
		Offer[]
	>(async (keys: readonly PaginatedLoad<string, OfferFilterDto>[]) => {
		const map = await this.offerService.mapByPromoCodeIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly byRewardPaginated = new DataLoader<
		PaginatedLoad<string, OfferFilterDto>,
		Offer[]
	>(async (keys: readonly PaginatedLoad<string, OfferFilterDto>[]) => {
		const map = await this.offerService.mapByRewardIdsPaginated([...keys]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly parentsByOfferPaginated = new DataLoader<
		PaginatedLoad<string, OfferFilterDto>,
		Offer[]
	>(async (keys: readonly PaginatedLoad<string, OfferFilterDto>[]) => {
		const map = await this.offerService.mapParentsByOfferIdsPaginated([
			...keys,
		]);
		return keys.map(([key]) => map.get(key) ?? []);
	});

	public readonly childrenByOfferPaginated = new DataLoader<
		PaginatedLoad<string, OfferFilterDto>,
		Offer[]
	>(async (keys: readonly PaginatedLoad<string, OfferFilterDto>[]) => {
		const map = await this.offerService.mapChildrenByOfferIdsPaginated([
			...keys,
		]);
		return keys.map(([key]) => map.get(key) ?? []);
	});
}

import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { PromoCode } from '@prisma/client';

import { paginate, PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { PaginatedOffers } from '@/offer/dto/graphql/offer.dto';
import { OfferLoader } from '@/offer/offer.loader';
import { ContentInputDto } from '@/content/dto/request/content-input.dto';
import { OfferFilterDto } from '@/offer/dto/request/filter.dto';

import { PromoCodeService } from './promo-code.service';
import { PromoCodeFilterDto } from './dto/request/promo-code-filter.dto';
import { CreatePromoCodeDto } from './dto/request/create-promo-code.dto';
import { PromoCodeActivationDto } from './dto/graphql/promo-code-activation.dto';
import { PromoCodeLoader } from './promo-code.loader';
import {
	PaginatedPromoCodes,
	PromoCodeDto,
} from './dto/graphql/promo-code.dto';

@Resolver(() => PromoCodeDto)
export class PromoCodeResolver {
	constructor(
		private readonly promoService: PromoCodeService,
		private readonly promoLoader: PromoCodeLoader,
		private readonly offerLoader: OfferLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedPromoCodes)
	async promoCodes(
		@Args('filter', { type: () => PromoCodeFilterDto, nullable: true })
		filter?: PromoCodeFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedPromoCodes> {
		return this.promoService.findAllPaginated(filter, pagination);
	}

	@AdminAccess()
	@Query(() => PromoCodeDto)
	async promoCode(
		@Args('id', { type: () => String }) id: string,
	): Promise<PromoCodeDto> {
		return this.promoService.findOne(id);
	}

	@AdminAccess()
	@Mutation(() => PromoCodeDto)
	async createPromoCode(
		@Args('promoCode', { type: () => CreatePromoCodeDto })
		dto: CreatePromoCodeDto,
	): Promise<PromoCodeDto> {
		return this.promoService.create(dto);
	}

	@AdminAccess()
	@Mutation(() => PromoCodeDto)
	async linkOfferToPromoCode(
		@Args('id', { type: () => String })
		id: string,
		@Args('offerId', { type: () => String })
		offerId: string,
	): Promise<PromoCodeDto> {
		return this.promoService.linkOffer(id, offerId);
	}

	@AdminAccess()
	@Mutation(() => PromoCodeDto)
	async unlinkOfferFromPromoCode(
		@Args('id', { type: () => String })
		id: string,
		@Args('offerId', { type: () => String })
		offerId: string,
	): Promise<PromoCodeDto> {
		return this.promoService.unlinkOffer(id, offerId);
	}

	@AdminAccess()
	@Mutation(() => PromoCodeDto)
	async updatePromoCode(
		@Args('id', { type: () => String })
		id: string,
		@Args('isActive', { type: () => Boolean, nullable: true })
		isActive: boolean,
		@Args('content', { type: () => ContentInputDto, nullable: true })
		content: ContentInputDto,
	): Promise<PromoCodeDto> {
		return this.promoService.update(id, { isActive, content });
	}

	@AdminAccess()
	@ResolveField(() => PaginatedOffers)
	async offers(
		@Parent() promoCode: PromoCode,
		@Args('filter', { type: () => OfferFilterDto, nullable: true })
		filter?: OfferFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedOffers> {
		return paginate(
			(take, skip, cursor) =>
				this.offerLoader.byPromoCodePaginated.load([
					promoCode.id,
					filter,
					take,
					skip,
					cursor,
				]),
			(item) => item.id,
			pagination,
		);
	}

	@AdminAccess()
	@ResolveField(() => [PromoCodeActivationDto])
	async activations(
		@Parent() promoCode: PromoCode,
	): Promise<PromoCodeActivationDto[]> {
		return this.promoLoader.activationsByPromoCodeId.load(promoCode.id);
	}
}

import {
	Args,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
} from '@nestjs/graphql';
import { PhoneNumber, PhoneNumberStatus } from '@prisma/client';

import { PaginationArgs } from '@/paginated';
import { AdminAccess } from '@/auth/access.decorator';
import { SubscriptionDto } from '@/subscription/dto/graphql/subscription.dto';
import { SubscriptionLoader } from '@/subscription/subscription.loader';

import { PhoneNumberService } from './phone-number.service';
import { PhoneNumberFilterDto } from './dto/request/phone-number-filter.dto';
import { PhoneNumberOverviewDto } from './dto/graphql/phone-number-overview.dto';
import { CreatePhoneNumberDto } from './dto/request/create-phone-number.dto';
import {
	PaginatedPhoneNumbers,
	PhoneNumberDto,
} from './dto/graphql/phone-number.dto';

@Resolver(() => PhoneNumberDto)
export class PhoneNumberResolver {
	constructor(
		private readonly phoneNumService: PhoneNumberService,
		private readonly subLoader: SubscriptionLoader,
	) {}

	@AdminAccess()
	@Query(() => PaginatedPhoneNumbers)
	async phoneNumbers(
		@Args('filter', { type: () => PhoneNumberFilterDto, nullable: true })
		filter?: PhoneNumberFilterDto,
		@Args('pagination', { type: () => PaginationArgs, nullable: true })
		pagination?: PaginationArgs,
	): Promise<PaginatedPhoneNumbers> {
		return this.phoneNumService.findAll(filter, pagination);
	}

	@AdminAccess()
	@Query(() => PhoneNumberOverviewDto)
	async phoneNumberOverview(): Promise<PhoneNumberOverviewDto> {
		return this.phoneNumService.getOverview();
	}

	@AdminAccess()
	@Mutation(() => PhoneNumberDto)
	async createPhoneNumber(
		@Args('phoneNumber', { type: () => CreatePhoneNumberDto })
		dto: CreatePhoneNumberDto,
	): Promise<PhoneNumberDto> {
		return this.phoneNumService.create(dto);
	}

	@AdminAccess()
	@Mutation(() => PhoneNumberDto)
	async changePhoneNumberStatus(
		@Args('msisdn', { type: () => String })
		msisdn: string,
		@Args('status', { type: () => PhoneNumberStatus })
		status: PhoneNumberStatus,
	): Promise<PhoneNumberDto> {
		return this.phoneNumService.changeStatus(msisdn, status);
	}

	@AdminAccess()
	@ResolveField(() => SubscriptionDto, { nullable: true })
	async currentSubscription(@Parent() phoneNum: PhoneNumber) {
		return this.subLoader.byCurrentPhoneNumber.load(phoneNum.msisdn);
	}
}

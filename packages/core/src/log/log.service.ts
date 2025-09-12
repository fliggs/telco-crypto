import { Injectable } from '@nestjs/common';
import { LogEventType } from '@prisma/client';

import { DbService } from '@/db/db.service';
import { OnEvent } from '@/events/event.decorator';
import { UserDto } from '@/user/dto/transfer/user.dto';
import { OrderDto } from '@/order/dto/graphql/order.dto';
import { OnboardingEventDto } from '@/onboarding/dto/transfer/onboarding-event.dto';
import { SubscriptionDto } from '@/subscription/dto/transfer/subscription.dto';
import { paginate, PaginationArgs } from '@/paginated';
import {
	USER_EVENT_CREATED,
	USER_EVENT_DELETED,
	USER_EVENT_VERIFIED,
} from '@/user/user.events';
import {
	ONBOARDING_EVENT_COMPLETED,
	ONBOARDING_EVENT_STARTED,
} from '@/onboarding/onboarding.events';
import {
	ORDER_EVENT_ABORTED,
	ORDER_EVENT_COMPLETED,
	ORDER_EVENT_CONFIRMED,
	ORDER_EVENT_CREATED,
	ORDER_EVENT_ERRORED,
} from '@/order/order.events';
import {
	SUBSCRIPTION_EVENT_ACTIVATED,
	SUBSCRIPTION_EVENT_CANCELLED,
	SUBSCRIPTION_EVENT_CREATED,
	SUBSCRIPTION_EVENT_DEACTIVATED,
	SUBSCRIPTION_EVENT_REACTIVATED,
	SUBSCRIPTION_EVENT_SUSPENDED,
	SUBSCRIPTION_EVENT_UNCANCELLED,
} from '@/subscription/subscription.events';

import { LogEventFilterDto } from './dto/request/log-event-filter.dto';

@Injectable()
export class LogService {
	constructor(private readonly db: DbService) {}

	async findAll(filter?: LogEventFilterDto, args?: PaginationArgs) {
		return paginate(
			(take, skip, cursor) =>
				this.db.logEvent.findMany({
					where: {
						...(filter?.type ? { type: filter.type } : null),
					},
					take,
					skip,
					cursor: cursor ? { id: cursor } : undefined,
					orderBy: [{ createdAt: 'desc' }],
				}),
			(item) => item.id,
			args,
		);
	}

	@OnEvent(USER_EVENT_CREATED)
	async onUserCreate(dto: UserDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.USER_CREATED,
				userId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(USER_EVENT_VERIFIED)
	async onUserVerified(dto: UserDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.USER_VERIFIED,
				userId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(USER_EVENT_DELETED)
	async onUserDeleted(dto: UserDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.USER_DELETED,
				userId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(ONBOARDING_EVENT_STARTED)
	async onOnboardingStarted(dto: OnboardingEventDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.ONBOARDING_STAGE_STARTED,
				userId: dto.userId,
				data: dto,
			},
		});
	}

	@OnEvent(ONBOARDING_EVENT_COMPLETED)
	async onOnboardingCompleted(dto: OnboardingEventDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.ONBOARDING_STAGE_COMPLETED,
				userId: dto.userId,
				data: dto,
			},
		});
	}

	@OnEvent(ORDER_EVENT_CREATED)
	async onOrderCreated(dto: OrderDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.ORDER_CREATED,
				userId: dto.userId,
				orderId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(ORDER_EVENT_CONFIRMED)
	async onOrderConfirmed(dto: OrderDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.ORDER_CONFIRMED,
				userId: dto.userId,
				orderId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(ORDER_EVENT_COMPLETED)
	async onOrderCompleted(dto: OrderDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.ORDER_COMPLETED,
				userId: dto.userId,
				orderId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(ORDER_EVENT_ERRORED)
	async onOrderErrored(dto: OrderDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.ORDER_ERRORED,
				userId: dto.userId,
				orderId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(ORDER_EVENT_ABORTED)
	async onOrderAborted(dto: OrderDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.ORDER_ABORTED,
				userId: dto.userId,
				orderId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(SUBSCRIPTION_EVENT_CREATED)
	async onSubCreated(dto: SubscriptionDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.SUBSCRIPTION_CREATED,
				userId: dto.userId,
				subscriptionId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(SUBSCRIPTION_EVENT_ACTIVATED)
	async onSubActivated(dto: SubscriptionDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.SUBSCRIPTION_ACTIVATED,
				userId: dto.userId,
				subscriptionId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(SUBSCRIPTION_EVENT_CANCELLED)
	async onSubCancelled(dto: SubscriptionDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.SUBSCRIPTION_CANCELLED,
				userId: dto.userId,
				subscriptionId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(SUBSCRIPTION_EVENT_UNCANCELLED)
	async onSubUncancelled(dto: SubscriptionDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.SUBSCRIPTION_UNCANCELLED,
				userId: dto.userId,
				subscriptionId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(SUBSCRIPTION_EVENT_REACTIVATED)
	async onSubReactivated(dto: SubscriptionDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.SUBSCRIPTION_REACTIVATED,
				userId: dto.userId,
				subscriptionId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(SUBSCRIPTION_EVENT_DEACTIVATED)
	async onSubDeactivated(dto: SubscriptionDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.SUBSCRIPTION_DEACTIVATED,
				userId: dto.userId,
				subscriptionId: dto.id,
				data: dto,
			},
		});
	}

	@OnEvent(SUBSCRIPTION_EVENT_SUSPENDED)
	async onSubSuspended(dto: SubscriptionDto) {
		await this.db.logEvent.create({
			data: {
				type: LogEventType.SUBSCRIPTION_SUSPENDED,
				userId: dto.userId,
				subscriptionId: dto.id,
				data: dto,
			},
		});
	}
}

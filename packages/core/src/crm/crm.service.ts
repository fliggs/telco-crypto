import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	Invoice,
	Subscription,
	User,
	Address,
	Order,
	Offer,
	Plan,
	Sim,
} from '@prisma/client';

import { OnEvent } from '@/events/event.decorator';
import { SubscriptionDto } from '@/subscription/dto/transfer/subscription.dto';
import { SUBSCRIPTION_EVENT_CANCELLED } from '@/subscription/subscription.events';
import { SubscriptionService } from '@/subscription/subscription.service';
import { UserService } from '@/user/user.service';

@Injectable()
export abstract class CrmService {
	protected readonly logger = new Logger(CrmService.name);
	protected abstract readonly name: string;

	constructor(
		protected readonly config: ConfigService,
		private readonly userService: UserService,
		private readonly subService: SubscriptionService,
	) {}

	abstract sendVerifyCode(email: string, code: string): Promise<void>;

	abstract sendResetCode(email: string, code: string): Promise<void>;

	abstract paymentFailed(
		email: string,
		invoice: Invoice,
		code: string,
		message: string,
	): Promise<void>;

	abstract shipSim(order: Order, address: Address): Promise<void>;

	abstract simShipped(
		user: User,
		sub: Subscription,
		offer: Offer,
		plan: Plan,
	): Promise<void>;

	abstract subActivated(
		user: User,
		sub: Subscription,
		offer: Offer,
		plan: Plan,
		msisdn: string,
		sim: Sim,
	): Promise<void>;

	abstract subCancelled(
		user: User,
		sub: Subscription,
		offer: Offer,
		plan: Plan,
		expiresAt: Date,
	): Promise<void>;

	@OnEvent(SUBSCRIPTION_EVENT_CANCELLED)
	async onSubscriptionCancelled(dto: SubscriptionDto) {
		const sub =
			await this.subService.findOneForUserWithCurrentPeriodAndOfferAndPlan(
				dto.id,
				dto.userId,
			);
		const user = await this.userService.findOne(dto.userId);

		this.subCancelled(
			user,
			sub,
			sub.offer,
			sub.offer.plan,
			sub.currentPeriod?.endsAt ?? new Date(),
		);
	}
}

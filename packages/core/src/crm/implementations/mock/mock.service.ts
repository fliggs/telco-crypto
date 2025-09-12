import { Injectable } from '@nestjs/common';
import {
	Invoice,
	Plan,
	Subscription,
	User,
	Address,
	Offer,
	Order,
	Sim,
} from '@prisma/client';

import { CrmService } from '@/crm/crm.service';

// TODO: We could use some kind of local mail service to test this
@Injectable()
export class CrmMockService extends CrmService {
	protected readonly name: string = 'mock';

	override async sendVerifyCode(email: string, code: string): Promise<void> {
		// NO-OP
	}

	override async sendResetCode(email: string, code: string): Promise<void> {
		// NO-OP
	}

	override async paymentFailed(
		email: string,
		invoice: Invoice,
		code: string,
		message: string,
	): Promise<void> {
		// NO-OP
	}

	override async shipSim(order: Order, address: Address): Promise<void> {
		// NO-OP
	}
	override async simShipped(
		user: User,
		sub: Subscription,
		offer: Offer,
		plan: Plan,
	): Promise<void> {
		// NO-OP
	}

	override async subActivated(
		user: User,
		sub: Subscription,
		offer: Offer,
		plan: Plan,
		msisdn: string,
		sim: Sim,
	): Promise<void> {
		// NO-OP
	}

	override async subCancelled(
		user: User,
		sub: Subscription,
		offer: Offer,
		plan: Plan,
		periodEndsAt: Date,
	): Promise<void> {
		// NO-OP
	}
}

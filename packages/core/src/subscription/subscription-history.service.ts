import { DbService } from '@/db/db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubscriptionHistoryService {
	constructor(private readonly db: DbService) {}

	async findBySubscription(subId: string) {
		return this.db.subscriptionHistory.findMany({
			where: {
				subscriptionId: subId,
			},
			include: {
				usage: true,
			},
		});
	}

	async findBySim(iccid: string) {
		return this.db.subscriptionHistory.findMany({
			where: {
				simIccid: iccid,
			},
			include: {
				usage: true,
			},
		});
	}
}

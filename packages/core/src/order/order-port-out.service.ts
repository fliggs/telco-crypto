import { Injectable } from '@nestjs/common';

import { DbService } from '@/db/db.service';

@Injectable()
export class OrderPortOutService {
	constructor(private readonly db: DbService) {}

	async savePortOutRequest(id: string, request: any) {
		await this.db.orderPortOutDetails.update({
			where: {
				orderId: id,
			},
			data: {
				request,
			},
		});
	}

	async markPortOutApproved(id: string, approved: boolean) {
		return this.db.orderPortOutDetails.update({
			where: {
				orderId: id,
			},
			data: {
				approved,
			},
		});
	}

	async markPortOutComplete(id: string) {
		await this.db.orderPortOutDetails.update({
			where: {
				orderId: id,
			},
			data: {
				completed: true,
				order: {
					update: {
						runAt: null,
					},
				},
			},
		});
	}

	async markPortOutFailed(id: string, error: unknown) {
		await this.db.orderPortOutDetails.update({
			where: {
				orderId: id,
			},
			data: {
				error,
				order: {
					update: {
						runAt: null,
					},
				},
			},
		});
	}
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaxProvider } from '@prisma/client';

import { DbService } from '@/db/db.service';
import { EventsService } from '@/events/events.service';
import { CheckAddressDto } from '@/address/dto/internal/check-address.dto';

import { TaxItemDto } from './dto/internal/tax-item.dto';
import { GetTaxForOrderDto } from './dto/internal/order-tax';

@Injectable()
export abstract class TaxService {
	protected readonly logger = new Logger(TaxService.name);
	protected abstract readonly name: TaxProvider;

	constructor(
		protected readonly config: ConfigService,
		private readonly events: EventsService,
		private readonly db: DbService,
	) {}

	abstract checkAddress(dto: CheckAddressDto): Promise<void>;

	abstract calcForOrder(dto: GetTaxForOrderDto): Promise<TaxItemDto[]>;

	abstract markOrderPaid(orderId: string): Promise<void>;

	abstract markOrderVoid(orderId: string): Promise<void>;

	abstract refundedOrder(orderId: string): Promise<void>;

	protected async getOrderTaxData<T>(orderId: string): Promise<T | null> {
		const data = await this.db.orderTaxData.findUnique({
			where: {
				provider_orderId: {
					provider: this.name,
					orderId,
				},
			},
		});
		return (data?.data as T) ?? null;
	}

	protected async setOrderTaxData<T>(orderId: string, data: T): Promise<void> {
		await this.db.orderTaxData.upsert({
			where: {
				provider_orderId: {
					provider: this.name,
					orderId,
				},
			},
			create: {
				provider: this.name,
				orderId,
				data,
			},
			update: {
				data,
			},
		});
	}

	protected async getPlanTaxData<T>(planId: string): Promise<T | null> {
		const data = await this.db.planTaxData.findUnique({
			where: {
				provider_planId: {
					provider: this.name,
					planId,
				},
			},
		});
		return (data?.data as T) ?? null;
	}

	protected async setPlanTaxData<T>(planId: string, data: T): Promise<void> {
		await this.db.planTaxData.upsert({
			where: {
				provider_planId: {
					provider: this.name,
					planId,
				},
			},
			create: {
				provider: this.name,
				planId,
				data,
			},
			update: {
				data,
			},
		});
	}
}

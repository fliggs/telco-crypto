import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClassConstructor } from 'class-transformer';
import { UserBillingData } from '@prisma/client';

import { DbService } from '@/db/db.service';

import { PayInvoiceDto } from './dto/internal/pay.dto';
import { RefundInvoiceDto } from './dto/internal/refund.dto';
import { VoidInvoiceDto } from './dto/internal/void.dto';

@Injectable()
export abstract class BillingService {
	protected readonly logger = new Logger(BillingService.name);
	protected abstract readonly name: string;

	constructor(
		protected readonly config: ConfigService,
		private readonly db: DbService,
	) {}

	async findUserDataByUser(userId: string) {
		return this.db.userBillingData.findMany({
			where: {
				userId,
			},
		});
	}

	allowedControllers(): ClassConstructor<unknown>[] {
		return [];
	}

	async checkUserSetupComplete(userId: string): Promise<void> {
		const res = await this.isUserSetupComplete(userId);
		if (!res) {
			throw new BadRequestException('payment_not_setup');
		}
	}

	async mapUserDataByUserId(ids: string[]) {
		const allData = await this.db.userBillingData.findMany({
			where: {
				userId: { in: ids },
			},
		});
		const map: Map<string, UserBillingData[]> = new Map();
		for (const data of allData) {
			let userData = map.get(data.userId);
			if (!userData) {
				userData = [];
				map.set(data.userId, userData);
			}
			userData.push(data);
		}
		return map;
	}

	// TODO: Convert args to dto
	abstract isUserSetupComplete(userId: string): Promise<boolean>;

	abstract pay(dto: PayInvoiceDto): Promise<void>;

	abstract refund(dto: RefundInvoiceDto): Promise<void>;

	abstract void(dto: VoidInvoiceDto): Promise<void>;

	protected async getUserBillingData<T>(userId: string): Promise<T | null> {
		const data = await this.db.userBillingData.findUnique({
			where: {
				provider_userId: {
					provider: this.name,
					userId,
				},
			},
		});
		return (data?.data as T) ?? null;
	}

	protected async setUserBillingData<T>(
		userId: string,
		newData: T,
	): Promise<T> {
		const { data } = await this.db.userBillingData.upsert({
			where: {
				provider_userId: {
					provider: this.name,
					userId,
				},
			},
			create: {
				provider: this.name,
				userId,
				data: newData,
			},
			update: {
				data: newData,
			},
		});
		return data as T;
	}

	protected async getInvoiceBillingData<T>(
		invoiceId: string,
	): Promise<T | null> {
		const data = await this.db.invoiceBillingData.findUnique({
			where: {
				provider_invoiceId: {
					provider: this.name,
					invoiceId,
				},
			},
		});
		return (data?.data as T) ?? null;
	}

	protected async setInvoiceBillingData<T>(invoiceId: string, data: T) {
		await this.db.invoiceBillingData.upsert({
			where: {
				provider_invoiceId: {
					provider: this.name,
					invoiceId,
				},
			},
			create: {
				provider: this.name,
				invoiceId,
				data,
			},
			update: {
				data,
			},
		});
	}
}

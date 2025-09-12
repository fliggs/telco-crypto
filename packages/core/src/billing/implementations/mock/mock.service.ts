import { Injectable } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

import { BillingService } from '@/billing/billing.service';
import { PayInvoiceDto } from '@/billing/dto/internal/pay.dto';
import { RefundInvoiceDto } from '@/billing/dto/internal/refund.dto';
import { VoidInvoiceDto } from '@/billing/dto/internal/void.dto';

import { BillingMockController } from './mock.controller';

const STEPS = 10;

@Injectable()
export class BillingMockService extends BillingService {
	protected readonly name: string = 'mock';

	override allowedControllers(): ClassConstructor<unknown>[] {
		return [...super.allowedControllers(), BillingMockController];
	}

	override async isUserSetupComplete(userId: string): Promise<boolean> {
		return true;
	}

	override async pay(dto: PayInvoiceDto) {}

	override async refund(dto: RefundInvoiceDto) {}

	override async void(dto: VoidInvoiceDto) {}
}

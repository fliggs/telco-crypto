import { Controller, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { BillingService } from '@/billing/billing.service';
import { BillingGuard } from '@/billing/billing.guard';

import { BillingMockService } from './mock.service';

@Controller({
	path: 'billing/mock',
	version: '1',
})
@ApiTags('Billing')
@UseGuards(BillingGuard)
export class BillingMockController {
	constructor(
		@Inject(BillingService)
		private readonly mockService: BillingMockService,
	) {}
}

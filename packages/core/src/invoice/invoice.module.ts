import { forwardRef, Module } from '@nestjs/common';

import { BillingModule } from '@/billing/billing.module';
import { TaxModule } from '@/tax/tax.module';
import { CreditModule } from '@/credit/credit.module';
import { OrderModule } from '@/order/order.module';

import { InvoiceService } from './invoice.service';
import { InvoiceResolver } from './invoice.resolver';
import { InvoiceLoader } from './invoice.loader';

@Module({
	imports: [
		forwardRef(() => BillingModule),
		forwardRef(() => CreditModule),
		forwardRef(() => TaxModule),
		forwardRef(() => OrderModule),
	],
	providers: [InvoiceService, InvoiceResolver, InvoiceLoader],
	controllers: [],
	exports: [InvoiceService, InvoiceLoader],
})
export class InvoiceModule {}

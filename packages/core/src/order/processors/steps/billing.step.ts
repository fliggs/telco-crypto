import { Invoice, InvoiceStatus, OrderRun } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';

import { Step, StepFactory } from '@/order/dto/internal/step.dto';
import { InvoiceService } from '@/invoice/invoice.service';
import { OrderWithDetails, ProcessorResult } from '@/order/order.processor';
import { TaxService } from '@/tax/tax.service';
import { UserService } from '@/user/user.service';
import { BillingService } from '@/billing/billing.service';
import { CrmService } from '@/crm/crm.service';

export class BillingStep extends Step {
	private readonly logger = new Logger(BillingStep.name);

	public readonly name = 'BILLING';

	constructor(
		config: unknown,
		private readonly invoiceService: InvoiceService,
		private readonly taxService: TaxService,
		private readonly userService: UserService,
		private readonly billingService: BillingService,
		private readonly crmService: CrmService,
	) {
		super(config);
	}

	public async run(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {
		const user = await this.userService.findOne(order.userId);
		const invoices = await this.invoiceService.findByOrderWithItems(order.id);

		let paidInvoices: Invoice[] = [];
		for (const invoice of invoices) {
			if (invoice.status !== InvoiceStatus.PENDING) {
				continue;
			}

			if (invoice.totalCost.gt(0)) {
				try {
					await this.billingService.pay({
						user: user,
						order: order,
						invoice: invoice,
						items: invoice.items,
					});
				} catch (err) {
					// TODO: Move this into a separate function?
					if (order.attempts <= 1) {
						try {
							const code = 'code' in err ? err.code : err.message;
							const msg = err.message;
							await this.crmService.paymentFailed(
								user.email,
								invoice,
								code,
								msg,
							);
						} catch (err) {
							this.logger.error(err);
						}
					}

					throw err;
				}
			}

			const paidInvoice = await this.invoiceService.markPaid(invoice.id);
			paidInvoices.push(paidInvoice);
		}

		await this.taxService.markOrderPaid(order.id);

		return {
			result: paidInvoices,
		};
	}

	public async abort(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {}
}

@Injectable()
export class BillingStepFactory extends StepFactory {
	constructor(
		private readonly invoiceService: InvoiceService,
		private readonly taxService: TaxService,
		private readonly userService: UserService,
		private readonly billingService: BillingService,
		private readonly crmService: CrmService,
	) {
		super();
	}

	public create(config: unknown): BillingStep {
		return new BillingStep(
			config,
			this.invoiceService,
			this.taxService,
			this.userService,
			this.billingService,
			this.crmService,
		);
	}
}

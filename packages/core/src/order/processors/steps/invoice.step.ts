import { InvoiceStatus, OrderRun, PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { DecimalNumber } from '@/decimal.dto';
import { DbService } from '@/db/db.service';
import { Step, StepFactory } from '@/order/dto/internal/step.dto';
import { OrderWithDetails, ProcessorResult } from '@/order/order.processor';
import { UserService } from '@/user/user.service';
import { TaxService } from '@/tax/tax.service';
import { PlanService } from '@/plan/plan.service';
import { OfferService } from '@/offer/offer.service';
import { InvoiceService } from '@/invoice/invoice.service';
import { CreditService } from '@/credit/credit.service';
import { AddressService } from '@/address/address.service';
import { InvoiceItemInputDto } from '@/invoice/dto/internal/invoice-item-input.dto';
import { CreditUsageDto } from '@/credit/dto/internal/credit-usage.dto';

interface Details {
	offerId: string;
}

export interface InvoiceStepConfig {
	getDetails: (order: OrderWithDetails, run: OrderRun) => Promise<Details>;
}

export class InvoiceStep extends Step<InvoiceStepConfig> {
	public readonly name = 'INVOICE';

	constructor(
		config: InvoiceStepConfig,
		private readonly db: DbService,
		private readonly offerService: OfferService,
		private readonly addrService: AddressService,
		private readonly creditService: CreditService,
		private readonly invoiceService: InvoiceService,
		private readonly planService: PlanService,
		private readonly taxService: TaxService,
		private readonly userService: UserService,
	) {
		super(config);
	}

	public async run(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {
		const details = await this.config.getDetails(order, run);
		const offer = await this.offerService.findOne(details.offerId);
		const plan = await this.planService.findOneWithVolumes(offer.planId);
		const user = await this.userService.findOne(order.userId);

		const items: InvoiceItemInputDto[] = [];
		items.push({
			name: plan.name,
			title: plan.content.title ?? plan.name,
			description: '', // TODO: We could fill this from the content
			amount: 1,
			costPerItem: offer.cost,
			totalCost: offer.cost,
		});

		let remaining = new DecimalNumber(0);
		const creditUsages: CreditUsageDto[] = [];

		const addresses = await this.addrService.findByUser(order.userId);

		const taxes = await this.taxService.calcForOrder({
			orderId: order.id,
			user: user,
			offer: offer,
			addresses,
		});

		for (const tax of taxes) {
			items.push({
				name: tax.name,
				title: tax.title,
				description: tax.description,
				amount: 1,
				costPerItem: tax.cost,
				totalCost: tax.cost,
			});
		}

		remaining = this.invoiceService.total(items);

		const credits = await this.creditService.findUnusedByUserAndSubscription(
			order.userId,
			order.subscriptionId!,
		);

		const invoice = await this.db.$transaction(async (tx: PrismaClient) => {
			const invoice = await this.invoiceService.create(order.id, tx);

			while (remaining.gt(0) && credits.length > 0) {
				const credit = credits.pop();
				if (!credit) {
					break;
				}

				const remainingCostUsed = DecimalNumber.min(
					remaining,
					credit.providedCost.sub(credit.usedCost),
				);

				if (remainingCostUsed.gt(0)) {
					remaining = remaining.sub(remainingCostUsed);

					items.push({
						name: 'user-credit',
						title: credit.content.title ?? 'Credit',
						description: '', // TODO: We could fill this from the content
						amount: 1,
						costPerItem: remainingCostUsed.neg(),
						totalCost: remainingCostUsed.neg(),
					});

					creditUsages.push({
						orderId: order.id,
						creditId: credit.id,
						invoiceId: invoice.id,
						usedCost: remainingCostUsed,
						oldUsedCost: credit.usedCost,
					});
				}
			}

			await this.invoiceService.addItems(invoice.id, items, tx);

			await this.creditService.useCredits(creditUsages, tx);

			return invoice;
		});

		return {
			result: invoice,
		};
	}

	public async abort(
		order: OrderWithDetails,
		run: OrderRun,
	): Promise<ProcessorResult> {
		const invoices = await this.invoiceService.findByOrderWithItems(order.id);

		for (const invoice of invoices) {
			if (invoice.status !== InvoiceStatus.PENDING) {
				continue;
			}

			await this.invoiceService.void(invoice.id);
		}
	}
}

@Injectable()
export class InvoiceStepFactory extends StepFactory<InvoiceStepConfig> {
	constructor(
		private readonly db: DbService,
		private readonly offerService: OfferService,
		private readonly addrService: AddressService,
		private readonly creditService: CreditService,
		private readonly invoiceService: InvoiceService,
		private readonly planService: PlanService,
		private readonly taxService: TaxService,
		private readonly userService: UserService,
	) {
		super();
	}

	public create(config: InvoiceStepConfig): InvoiceStep {
		return new InvoiceStep(
			config,
			this.db,
			this.offerService,
			this.addrService,
			this.creditService,
			this.invoiceService,
			this.planService,
			this.taxService,
			this.userService,
		);
	}
}

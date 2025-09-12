import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TaxProvider } from '@prisma/client';

import { DecimalNumber } from '@/decimal.dto';
import { TaxService } from '@/tax/tax.service';
import { TaxItemDto } from '@/tax/dto/internal/tax-item.dto';
import { AddressDto } from '@/address/dto/internal/address.dto';
import { GetTaxForOrderDto } from '@/tax/dto/internal/order-tax';

@Injectable()
export class TaxMockService extends TaxService {
	protected readonly name = TaxProvider.MOCK;

	override async checkAddress(dto: AddressDto): Promise<void> {}

	override async calcForOrder(dto: GetTaxForOrderDto): Promise<TaxItemDto[]> {
		const items: TaxItemDto[] = [];
		if (dto.offer) {
			items.push({
				id: randomUUID(),
				name: 'test_tax',
				title: 'Test Tax (10%)',
				description: 'This tax is added during testing',
				cost: dto.offer.cost.mul(new DecimalNumber(0.1)),
				tags: ['test', 'tax'],
			});
		}
		return items;
	}

	override async markOrderPaid(orderId: string): Promise<void> {}

	override async markOrderVoid(orderId: string): Promise<void> {}

	override async refundedOrder(orderId: string): Promise<void> {}
}

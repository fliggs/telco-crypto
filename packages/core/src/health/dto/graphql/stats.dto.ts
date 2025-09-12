import { InvoiceStatus, OrderStatus } from '@prisma/client';
import { Field, Int, ObjectType } from '@nestjs/graphql';

import { DecimalNumber, DecimalScalar } from '@/decimal.dto';
import { EnumMap } from '@/mapped';

@ObjectType()
export class StatsDto {
	@Field(() => DecimalScalar)
	openInvoicesTotal: DecimalNumber;

	@EnumMap(
		OrderStatus,
		{ type: 'integer' },
		{ name: 'OrderStatusCount', type: () => Int },
	)
	orderCounts: Record<OrderStatus, number>;

	@Field(() => [UserHistoryStatDto])
	userHistory: UserHistoryStatDto[];

	@Field(() => [InvoiceHistoryStatDto])
	invoiceHistory: InvoiceHistoryStatDto[];

	@Field(() => [OrderHistoryStatDto])
	orderHistory: OrderHistoryStatDto[];
}

@ObjectType()
export class UserHistoryStatDto {
	@Field()
	timestamp: Date;

	@Field(() => [UserHistoryStatCountDto])
	counts: UserHistoryStatCountDto[];
}

@ObjectType()
export class UserHistoryStatCountDto {
	@Field(() => String)
	name: string;

	@Field(() => Int)
	count: number;
}

@ObjectType()
export class InvoiceHistoryStatDto {
	@Field()
	timestamp: Date;

	@EnumMap(
		InvoiceStatus,
		{ type: 'integer' },
		{ name: 'InvoiceStatusHistory', type: () => Int },
	)
	counts: Record<InvoiceStatus, Number>;
}

@ObjectType()
export class OrderHistoryStatDto {
	@Field()
	timestamp: Date;

	@EnumMap(
		OrderStatus,
		{ type: 'integer' },
		{ name: 'OrderStatusHistory', type: () => Int },
	)
	counts: Record<OrderStatus, Number>;
}

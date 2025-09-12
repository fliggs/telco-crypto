import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderAction, OrderStatus, OrderType } from '@prisma/client';

import { Paginated } from '@/paginated';

registerEnumType(OrderType, { name: 'OrderType' });
registerEnumType(OrderStatus, { name: 'OrderStatus' });
registerEnumType(OrderAction, { name: 'OrderAction' });

@ObjectType()
export class OrderDto {
	@Field()
	id: string;

	@Field(() => OrderType)
	type: OrderType;

	@Field(() => OrderStatus)
	status: OrderStatus;

	@Field(() => OrderAction)
	action: OrderAction;

	@Field(() => Int, { nullable: true })
	stepNo: number | null;

	@Field()
	createdAt: Date;

	@Field(() => Date, { nullable: true })
	startedAt: Date | null;

	@Field(() => Date, { nullable: true })
	confirmedAt: Date | null;

	@Field(() => Date, { nullable: true })
	completedAt: Date | null;

	@Field(() => Date, { nullable: true })
	runAt: Date | null;

	@Field(() => Int)
	attempts: number;

	@Field()
	userId: string;

	@Field(() => String, { nullable: true })
	subscriptionId: string | null;
}

@ObjectType()
export class PaginatedOrders extends Paginated(OrderDto) {}

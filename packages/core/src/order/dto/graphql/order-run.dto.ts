import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderAction, OrderRunStatus } from '@prisma/client';

registerEnumType(OrderAction, { name: 'OrderAction' });
registerEnumType(OrderRunStatus, { name: 'OrderRunStatus' });

@ObjectType()
export class OrderRunDto {
	@Field()
	id: string;

	@Field(() => OrderAction)
	action: OrderAction;

	@Field(() => OrderRunStatus)
	status: OrderRunStatus;

	@Field(() => Int, { nullable: true })
	stepNo: number | null;

	@Field()
	orderId: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	completedAt: Date | null;
}

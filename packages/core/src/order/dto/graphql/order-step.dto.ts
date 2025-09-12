import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderAction, OrderStepStatus } from '@prisma/client';

registerEnumType(OrderAction, { name: 'OrderAction' });
registerEnumType(OrderStepStatus, { name: 'OrderStepStatus' });

@ObjectType()
export class OrderStepDto {
	@Field(() => Int)
	stepNo: number;

	@Field()
	type: string;

	@Field(() => OrderStepStatus)
	status: OrderStepStatus;

	@Field(() => OrderAction)
	action: OrderAction;

	@Field()
	orderId: string;

	@Field(() => Int)
	attempts: number;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	startedAt: Date | null;

	@Field(() => Date, { nullable: true })
	completedAt: Date | null;
}

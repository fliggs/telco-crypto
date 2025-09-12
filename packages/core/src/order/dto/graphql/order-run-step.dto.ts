import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { OrderAction, OrderRunStepStatus } from '@prisma/client';

registerEnumType(OrderAction, { name: 'OrderAction' });
registerEnumType(OrderRunStepStatus, { name: 'OrderRunStepStatus' });

@ObjectType()
export class OrderRunStepDto {
	@Field()
	runId: string;

	@Field(() => Int)
	stepNo: number;

	@Field()
	orderId: string;

	@Field()
	type: string;

	@Field(() => OrderRunStepStatus)
	status: OrderRunStepStatus;

	@Field(() => OrderAction)
	action: OrderAction;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => Date, { nullable: true })
	startedAt: Date | null;

	@Field(() => Date, { nullable: true })
	completedAt: Date | null;
}

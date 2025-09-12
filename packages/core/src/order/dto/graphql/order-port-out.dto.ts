import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SimType } from '@prisma/client';

registerEnumType(SimType, { name: 'SimType' });

@ObjectType()
export class OrderPortOutDetailsDto {
	@Field()
	orderId: string;

	@Field()
	completed: boolean;

	@Field()
	approved: boolean;

	@Field(() => String, { nullable: true })
	accountNumber?: string | null;

	@Field(() => String, { nullable: true })
	password?: string | null;
}

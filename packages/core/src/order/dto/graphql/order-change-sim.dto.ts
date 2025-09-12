import { Field, ObjectType } from '@nestjs/graphql';
import { SimType } from '@prisma/client';

@ObjectType()
export class OrderChangeSimDetailsDto {
	@Field()
	orderId: string;

	@Field(() => SimType)
	newSimType?: SimType;

	@Field(() => String, { nullable: true })
	newSimIccid?: string | null;
}

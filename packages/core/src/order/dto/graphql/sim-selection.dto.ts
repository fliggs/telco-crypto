import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { SimType } from '@prisma/client';

registerEnumType(SimType, { name: 'SimType' });

@ObjectType()
export class SimSelectionDto {
	@Field(() => SimType, { nullable: true })
	simType?: SimType | null;

	@Field(() => String, { nullable: true })
	iccid?: string | null;
}

import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TelcoProvider } from '@prisma/client';

registerEnumType(TelcoProvider, { name: 'TelcoProvider' });

@ObjectType()
export class PlanTelcoDataDto {
	@Field()
	id: string;

	@Field(() => TelcoProvider)
	provider: TelcoProvider;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

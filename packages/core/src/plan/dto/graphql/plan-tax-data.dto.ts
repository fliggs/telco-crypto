import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { TaxProvider } from '@prisma/client';

registerEnumType(TaxProvider, { name: 'TaxProvider' });

@ObjectType()
export class PlanTaxDataDto {
	@Field()
	id: string;

	@Field(() => TaxProvider)
	provider: TaxProvider;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}

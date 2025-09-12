import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { TaxProvider } from '@prisma/client';
import { IsEnum, IsJSON, IsString } from 'class-validator';

registerEnumType(TaxProvider, { name: 'TaxProvider' });

@InputType()
export class PlanTaxDataInputDto {
	@IsEnum(TaxProvider)
	@Field(() => TaxProvider)
	provider: TaxProvider;

	@IsJSON()
	@Field()
	data: string;
}

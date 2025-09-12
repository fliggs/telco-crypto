import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { TelcoProvider } from '@prisma/client';
import { IsEnum, IsJSON } from 'class-validator';

registerEnumType(TelcoProvider, { name: 'TelcoProvider' });

@InputType()
export class PlanTelcoDataInputDto {
	@IsEnum(TelcoProvider)
	@Field(() => TelcoProvider)
	provider: TelcoProvider;

	@IsJSON()
	@Field()
	data: string;
}

import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { InvoiceStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });

@InputType()
export class InvoiceFilterDto {
	@IsEnum(InvoiceStatus)
	@IsOptional()
	@Field(() => InvoiceStatus, { nullable: true })
	status?: InvoiceStatus;

	@IsString()
	@IsOptional()
	@Field(() => String, { nullable: true })
	id?: string | null;
}

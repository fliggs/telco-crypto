import { Field, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { LogEventType } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

registerEnumType(LogEventType, { name: 'LogEventType' });

@InputType()
export class LogEventFilterDto {
	@IsEnum(LogEventType)
	@IsOptional()
	@ApiProperty({ enum: LogEventType, enumName: 'LogEventType' })
	@Field(() => LogEventType, { nullable: true })
	type?: LogEventType;
}

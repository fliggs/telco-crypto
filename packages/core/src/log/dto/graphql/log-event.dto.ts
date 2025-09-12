import { Paginated } from '@/paginated';
import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { LogEventType } from '@prisma/client';

registerEnumType(LogEventType, { name: 'LogEventType' });

@ObjectType()
export class LogEventDto {
	@Field()
	id: string;

	@Field()
	createdAt: Date;

	@Field(() => LogEventType)
	type: LogEventType;

	@Field(() => String, { nullable: true })
	userId: string | null;

	@Field(() => String, { nullable: true })
	subscriptionId: string | null;

	@Field(() => String, { nullable: true })
	orderId: string | null;
}

@ObjectType()
export class PaginatedLogEvents extends Paginated(LogEventDto) {}

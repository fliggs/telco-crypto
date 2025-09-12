import { ApiProperty } from '@nestjs/swagger';
import { LogEventType } from '@prisma/client';
import { Expose } from 'class-transformer';

import { Paginated } from '@/paginated';

export class LogEventDto {
	@Expose()
	id: string;

	@Expose()
	createdAt: Date;

	@Expose()
	@ApiProperty({ enum: LogEventType, enumName: 'LogEventType' })
	type: LogEventType;

	@Expose()
	userId: string | null;

	@Expose()
	orderId: string | null;

	@Expose()
	subscriptionId: string | null;

	@Expose()
	data: any;
}

export class PaginatedLogEventDto extends Paginated(LogEventDto) {}

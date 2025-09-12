import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, OrderType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class PublicOrderDto {
	@Expose()
	id: string;

	@Expose()
	@ApiProperty({ enum: OrderType, enumName: 'OrderType' })
	type: OrderType;

	@Expose()
	@ApiProperty({ enum: OrderStatus, enumName: 'OrderStatus' })
	status: OrderStatus;

	@Expose()
	startedAt: Date | null;

	@Expose()
	completedAt: Date | null;

	@Expose()
	subscriptionId: string | null;
}

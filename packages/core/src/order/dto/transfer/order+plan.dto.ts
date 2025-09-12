import { OrderStatus, OrderType, SimType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { PlanWithVolumesDto } from '@/plan/dto/response/plan+volumes.dto';

export class OrderWithPlanDto {
	@Expose()
	id: string;

	@Expose()
	createdAt: Date;

	@Expose()
	confirmedAt: Date | null;

	@Expose()
	type: OrderType;

	@Expose()
	status: OrderStatus;

	@Expose()
	simType: SimType | null;

	@Expose()
	msisdn: string | null;

	@Expose()
	iccid: string | null;

	@Expose()
	userId: string;

	@Expose()
	@Type(() => PlanWithVolumesDto)
	plan: PlanWithVolumesDto | null;
}

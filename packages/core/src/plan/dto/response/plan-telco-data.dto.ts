import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PlanTelcoDataDto {
	@Expose()
	id: string;

	@Expose()
	provider: string;

	@Expose()
	createdAt: Date;

	@Expose()
	updatedAt: Date;

	@Expose()
	@ApiProperty({ type: 'object', additionalProperties: true })
	data: any;
}

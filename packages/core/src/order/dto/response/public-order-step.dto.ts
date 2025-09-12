import { ApiProperty } from '@nestjs/swagger';
import { OrderStepStatus } from '@prisma/client';
import { Expose, Transform } from 'class-transformer';

export class PublicOrderStepDto {
	@Expose()
	type: string;

	@Expose()
	@ApiProperty({ enum: OrderStepStatus, enumName: 'OrderStepStatus' })
	status: OrderStepStatus;

	@Expose()
	@Transform(
		({ obj, key, value }) => {
			if (
				key in obj &&
				obj[key] &&
				typeof obj[key] === 'object' &&
				'message' in obj[key] &&
				typeof obj[key].message === 'string'
			) {
				return obj[key].message;
			}
			return 'unknown_error';
		},
		{ toClassOnly: true },
	)
	@ApiProperty({ type: String, nullable: true })
	error: any;
}

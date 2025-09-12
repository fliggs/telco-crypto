import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { AuthProvider } from '../internal/auth-strategy.dto';

export class PublicAuthStrategyDto {
	@Expose()
	@ApiProperty({ enum: AuthProvider, enumName: 'AuthProvider' })
	provider: AuthProvider;

	@Expose()
	name: string;

	@Expose()
	title: string;

	@Expose()
	tags?: string[] | null;
}

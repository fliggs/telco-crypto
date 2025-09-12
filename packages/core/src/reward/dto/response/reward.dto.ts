import { ApiProperty } from '@nestjs/swagger';
import { RewardType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

import { Content } from '@/content/dto/internal/content.dto';
import { PublicContentDto } from '@/content/dto/response/public-content.dto';

export class RewardDto {
	@Expose()
	id: string;

	@Expose()
	createdAt: Date;

	@Expose()
	updatedAt: Date;

	@Expose()
	name: string;

	@Expose()
	@ApiProperty({ enum: RewardType, enumName: 'RewardType' })
	type: RewardType;

	@Expose()
	isActive: boolean;

	@Expose()
	validFrom: Date | null;

	@Expose()
	validUntil: Date | null;

	@Expose()
	data: any;

	@Expose()
	@Type(() => PublicContentDto)
	@ApiProperty({ type: PublicContentDto })
	content: Content;
}

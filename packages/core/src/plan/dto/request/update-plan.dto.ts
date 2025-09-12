import { IsInstance, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { ContentInputDto } from '@/content/dto/request/content-input.dto';
import { PublicContentDto } from '@/content/dto/response/public-content.dto';

export class UpdatePlanDto {
	@ValidateNested()
	@IsInstance(ContentInputDto)
	@IsOptional()
	@ApiProperty({ type: PublicContentDto })
	content?: ContentInputDto;
}

import { ContentInputDto } from '@/content/dto/request/content-input.dto';

export interface UpdatePromoCodeDto {
	isActive?: boolean;
	content?: ContentInputDto;
}

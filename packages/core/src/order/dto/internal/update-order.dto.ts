import { OrderPortInDataDto } from './port-in-data.dto';
import { OrderSimSelectionDataDto } from './sim-selection-data.dto';

export interface UpdateDraftOrderDto {
	offerId?: string;
	promoCodeId?: string;
	simSelection?: OrderSimSelectionDataDto;
	portIn?: OrderPortInDataDto;
}

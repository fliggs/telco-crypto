import {
	IsBoolean,
	IsInstance,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { PortInDto } from '@/order/dto/request/port-in.dto';
import { SimSelectionDto } from '@/order/dto/request/sim-selection.dto';

export class UpdateMyOrderV2Dto {
	@IsString()
	@IsOptional()
	offerId?: string;

	@IsString()
	@IsOptional()
	promoCodeId?: string;

	@ValidateNested()
	@IsInstance(PortInDto)
	@IsOptional()
	@Type(() => PortInDto)
	portIn?: PortInDto;

	@ValidateNested()
	@IsInstance(SimSelectionDto)
	@IsOptional()
	@Type(() => SimSelectionDto)
	simSelection?: SimSelectionDto;

	@IsBoolean()
	@IsOptional()
	confirm?: boolean;
}

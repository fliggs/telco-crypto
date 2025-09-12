import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { PublicAccess } from '@/auth/access.decorator';
import { PublicDeviceDto } from '@/device/dto/response/public-device.dto';

import { DeviceService } from './device.service';

@Controller({
	path: 'device',
	version: '1',
})
export class DeviceController {
	constructor(private readonly deviceService: DeviceService) {}

	@Get()
	@PublicAccess()
	@ApiQuery({ name: 'name', required: false })
	@ApiOkResponse({ type: [PublicDeviceDto] })
	@SerializeOptions({ type: PublicDeviceDto })
	async findDevices(@Query('name') name: string | undefined) {
		return this.deviceService.findMany(name);
	}
}

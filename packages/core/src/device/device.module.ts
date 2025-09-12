import { Module } from '@nestjs/common';

import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeviceResolver } from './device.resolver';

@Module({
	controllers: [DeviceController],
	providers: [DeviceService, DeviceResolver, DeviceResolver],
	exports: [DeviceService],
})
export class DeviceModule {}

import { forwardRef, Module } from '@nestjs/common';

import { DeviceModule } from '@/device/device.module';
import { CountryModule } from '@/country/country.module';

import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { SettingsResolver } from './settings.resolver';

@Module({
	imports: [forwardRef(() => DeviceModule), forwardRef(() => CountryModule)],
	providers: [SettingsService, SettingsResolver],
	controllers: [SettingsController],
	exports: [SettingsService],
})
export class SettingsModule {}

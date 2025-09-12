import {
	Controller,
	Get,
	Query,
	SerializeOptions,
	Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import { AdminAccess, PublicAccess } from '@/auth/access.decorator';
import { PublicContentDto } from '@/content/dto/response/public-content.dto';
import { DeviceService } from '@/device/device.service';
import { CountryService } from '@/country/country.service';
import { ContentBlockType } from '@/content/content-block.type';

import { SettingsService } from './settings.service';
import { PublicDeviceDto } from '../device/dto/response/public-device.dto';
import { PublicCountryDto } from '../country/dto/response/public-country.dto';

@Controller({
	path: 'settings',
	version: '1',
})
export class SettingsController {
	constructor(
		private readonly settingService: SettingsService,
		private readonly deviceService: DeviceService,
		private readonly countryService: CountryService,
	) {}

	@Get('terms-conditions')
	@PublicAccess()
	@SerializeOptions({ type: String })
	async getTermsAndConditions(): Promise<string[]> {
		const content = await this.settingService.getTermsAndConditions();
		const block = content.summary;
		return block?.type === ContentBlockType.TEXT ? block.text.split('\n') : [];
	}

	@Get('terms-conditions')
	@Version('2')
	@PublicAccess()
	@ApiOkResponse({ type: PublicContentDto })
	@SerializeOptions({ type: PublicContentDto })
	async getTermsAndConditionsV2() {
		return this.settingService.getTermsAndConditions();
	}

	@Get('privacy-policy')
	@PublicAccess()
	@SerializeOptions({ type: String })
	async getPrivacyPolicy(): Promise<string[]> {
		const content = await this.settingService.getPrivacyPolicy();
		const block = content.summary;
		return block?.type === ContentBlockType.TEXT ? block.text.split('\n') : [];
	}

	@Get('privacy-policy')
	@Version('2')
	@PublicAccess()
	@ApiOkResponse({ type: PublicContentDto })
	@SerializeOptions({ type: PublicContentDto })
	async getPrivacyPolicyV2() {
		return this.settingService.getPrivacyPolicy();
	}

	@Get('faqs')
	@PublicAccess()
	@ApiOkResponse({ type: PublicContentDto })
	@SerializeOptions({ type: PublicContentDto })
	async getFaqs() {
		return this.settingService.getFaqs();
	}

	@Get('supported-devices')
	@PublicAccess()
	@ApiQuery({ name: 'name', required: false })
	@ApiOkResponse({ type: [PublicDeviceDto] })
	@SerializeOptions({ type: PublicDeviceDto })
	async getSupportedDevices(@Query('name') name: string | undefined) {
		return this.deviceService.findMany(name);
	}

	@Get('supported-countries')
	@PublicAccess()
	@ApiQuery({ name: 'name', required: false })
	@ApiOkResponse({ type: [PublicCountryDto] })
	@SerializeOptions({ type: PublicCountryDto })
	async getSupportedCountries(@Query('name') name: string | undefined) {
		return this.countryService.findMany(name);
	}

	@Get('order-step-retries')
	@AdminAccess()
	async getOrderStepRetries(): Promise<number[]> {
		return this.settingService.getRetries();
	}
}

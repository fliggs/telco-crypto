import { Controller, Get, Query, SerializeOptions } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

import { PublicAccess } from '@/auth/access.decorator';
import { PublicCountryDto } from '@/country/dto/response/public-country.dto';

import { CountryService } from './country.service';

@Controller({
	path: 'country',
	version: '1',
})
export class CountryController {
	constructor(private readonly countryService: CountryService) {}

	@Get()
	@PublicAccess()
	@ApiQuery({ name: 'name', required: false })
	@SerializeOptions({ type: PublicCountryDto })
	async findDevices(
		@Query('name') name: string | undefined,
	): Promise<PublicCountryDto[]> {
		return this.countryService.findMany(name);
	}
}

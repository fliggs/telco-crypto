import { Module } from '@nestjs/common';

import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { CountryResolver } from './country.resolver';

@Module({
	providers: [CountryService, CountryResolver],
	controllers: [CountryController],
	exports: [CountryService],
})
export class CountryModule {}

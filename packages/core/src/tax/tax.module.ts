import { InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DbService } from '@/db/db.service';
import { EventsService } from '@/events/events.service';

import { TaxService } from './tax.service';
import { TaxResolver } from './tax.resolver';
import { TaxMockService } from './implementations/mock/mock.service';

@Module({
	providers: [
		{
			provide: TaxService,
			useFactory: (
				db: DbService,
				events: EventsService,
				config: ConfigService,
			) => {
				const telcoProvider = config.getOrThrow<string>('TAX_PROVIDER');
				switch (telcoProvider) {
					case 'mock':
						return new TaxMockService(config, events, db);

					default:
						throw new InternalServerErrorException('invalid_tax_provider');
				}
			},
			inject: [DbService, EventsService, ConfigService],
		},
		TaxResolver,
	],
	controllers: [],
	exports: [TaxService],
})
export class TaxModule {}

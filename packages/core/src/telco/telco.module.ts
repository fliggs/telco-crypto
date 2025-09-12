import { InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { DbService } from '@/db/db.service';

import { TelcoService } from './telco.service';
import { TelcoController } from './telco.controller';
import { TelcoResolver } from './telco.resolver';
import { TelcoMockService } from './implementations/mock/mock.service';

@Module({
	imports: [],
	providers: [
		{
			provide: TelcoService,
			useFactory: (db: DbService, config: ConfigService) => {
				const provider = config.getOrThrow<string>('TELCO_PROVIDER');
				switch (provider) {
					case 'mock':
						return new TelcoMockService(config, db);

					default:
						throw new InternalServerErrorException('invalid_telco_provider');
				}
			},
			inject: [DbService, ConfigService],
		},
		TelcoResolver,
	],
	controllers: [TelcoController],
	exports: [TelcoService],
})
export class TelcoModule {}

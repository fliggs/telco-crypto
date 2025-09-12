import { InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { SupportService } from './support.service';
import { SupportMockService } from './implementations/mock/mock.service';

@Module({
	imports: [JwtModule.register({})],
	providers: [
		{
			provide: SupportService,
			useFactory: (config: ConfigService, jwtService: JwtService) => {
				const provider = config.getOrThrow<string>('SUPPORT_PROVIDER');
				switch (provider) {
					case 'mock':
						return new SupportMockService(config);

					default:
						throw new InternalServerErrorException('invalid_support_provider');
				}
			},
			inject: [ConfigService, JwtService],
		},
	],
	controllers: [],
	exports: [SupportService],
})
export class SupportModule {}

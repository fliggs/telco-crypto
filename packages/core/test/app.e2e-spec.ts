import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from '@/app.module';
import { DbService } from '@/db/db.service';
import { DecimalNumber } from '@/decimal.dto';

describe('AppController (e2e)', () => {
	let app: NestExpressApplication;
	let dbMock: DeepMockProxy<DbService>;

	beforeAll(async () => {
		dbMock = mockDeep<DbService>();
		dbMock.offer.findMany.mockResolvedValue([
			{
				id: 'test-offer',
				name: 'base_small_std',
				version: 1,
				isActive: true,
				isPublic: true,
				sort: 1,
				cost: new DecimalNumber('20.00'),
				planId: 'test-plan',
				content: {
					tags: ['plan'],
				},
				originalCost: null,
				providedCredits: null,
				validFrom: null,
				validUntil: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		]);

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(DbService)
			.useValue(dbMock)
			.compile();

		app = moduleFixture.createNestApplication<NestExpressApplication>();
		app.set('query parser', 'extended');
		app.enableCors({ origin: true, credentials: true });
		app.enableShutdownHooks();
		app.enableVersioning();
		await app.init();
	});

	it('GET /v1', () => {
		return request(app.getHttpServer())
			.get('/v1')
			.expect(200)
			.expect('Welcome!');
	});

	it('GET /v1/offer/public', () => {
		return request(app.getHttpServer())
			.get('/v1/offer/public')
			.expect(200)
			.expect([
				{
					id: 'test-offer',
					sort: 1,
					validFrom: null,
					validUntil: null,
					cost: '20',
					content: { tags: ['plan'] },
				},
			]);
	});

	afterAll(async () => {
		await app.close();
	});
});

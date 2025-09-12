import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from './app.module';
import { EXTRA_MAPPED_MODELS } from './mapped';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: ['fatal', 'error', 'warn', 'log', 'debug'],
	});

	const config = app.get(ConfigService);
	const env = config.getOrThrow<string>('ENV');

	app.set('query parser', 'extended');
	app.set('trust proxy', 1);
	app.enableCors({ origin: true, credentials: true });
	app.enableShutdownHooks();
	app.enableVersioning();
	if (env !== 'production') {
		const docs = new DocumentBuilder()
			.setTitle('Fliggs')
			.setDescription('This is our cool new API')
			.setVersion('0.1')
			.addBearerAuth()
			.addGlobalParameters(
				{
					in: 'header',
					name: 'x-auth-provider',
					required: false,
					schema: { type: 'string' },
				},
				{
					in: 'header',
					name: 'x-auth-strategy',
					required: false,
					schema: { type: 'string' },
				},
			)
			.build();

		const document = SwaggerModule.createDocument(app, docs, {
			extraModels: [...EXTRA_MAPPED_MODELS],
			operationIdFactory: (controller, method, version) => {
				let c = controller.replace('Controller', '');
				c = c.substring(0, 1).toLowerCase() + c.substring(1);
				let m =
					method.substring(0, 1).toUpperCase() +
					method.substring(1).replace(/V\d+$/, '');
				let v = version
					? version?.substring(0, 1).toUpperCase() + version?.substring(1)
					: undefined;
				return `${c}${m}${v}`;
			},
		});

		SwaggerModule.setup('api', app, document, {
			swaggerOptions: {
				tagsSorter: 'alpha',
				operationsSorter: 'alpha',
			},
		});

		// Save API definition to yaml file
		await writeFile(join(__dirname, '..', 'api.yaml'), yaml.dump(document));
	}

	const host = config.get<string>('HOST', 'localhost');
	const port = config.get<number>('PORT', 2000);

	await app.listen(port, host);
}
bootstrap();

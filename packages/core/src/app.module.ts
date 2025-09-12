import {
	Logger,
	MiddlewareConsumer,
	Module,
	NestModule,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE, Reflector } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import * as session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { randomUUID } from 'node:crypto';
import helmet from 'helmet';

import { AccessGlobalGuard } from './auth/access-global.guard';
import { AddressModule } from './address/address.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BillingModule } from './billing/billing.module';
import { ContentModule } from './content/content.module';
import { CreditModule } from './credit/credit.module';
import { CrmModule } from './crm/crm.module';
import { CustomThrottlerGuard } from './auth/throttler.guard';
import { DbModule } from './db/db.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { InvoiceModule } from './invoice/invoice.module';
import { LogMiddleware } from './log/log.middleware';
import { LogModule } from './log/log.module';
import { MeModule } from './me/me.module';
import { OfferModule } from './offer/offer.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { OrderModule } from './order/order.module';
import { PhoneNumberModule } from './phone-number/phone-number.module';
import { PlanModule } from './plan/plan.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { RewardModule } from './reward/reward.module';
import { SessionGuard } from './session/session.guard';
import { SessionModule } from './session/session.module';
import { SettingsModule } from './settings/settings.module';
import { SimModule } from './sim/sim.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { SupportModule } from './support/support.module';
import { TaxModule } from './tax/tax.module';
import { TelcoModule } from './telco/telco.module';
import { UserModule } from './user/user.module';
import { VolumeModule } from './volume/volume.module';
import { WalletModule } from './wallet/wallet.module';
import { DecimalScalar } from './decimal.dto';

import authConfig from './auth/auth.config'; // Import here so we get nicer __dirname variables
import { DbService } from './db/db.service';
import { CustomValidationPipe } from './validation.pipe';
import { CustomClassSerializerInterceptor } from './serializer.interceptor';
import { DeviceModule } from './device/device.module';
import { CountryModule } from './country/country.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			load: [authConfig],
		}),
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			useFactory: (config: ConfigService) => {
				return {
					path: '/graphql',
					autoSchemaFile: {
						path: join(process.cwd(), 'schema.gql'),
					},
					context: ({ req, res, next }: any) => ({ req, res, next }),
					sortSchema: true,
					playground: config.getOrThrow<string>('ENV') !== 'production',
					resolvers: {
						DecimalNumber: DecimalScalar,
					},
				};
			},
			inject: [ConfigService],
		}),
		ThrottlerModule.forRoot([
			{
				ttl: 60000,
				limit: 600,
			},
		]),
		ScheduleModule.forRoot(),
		MeModule, // This module first because of how routes are resolved
		DbModule,
		AddressModule,
		AdminModule,
		AuthModule,
		BillingModule,
		ContentModule,
		CreditModule,
		CrmModule,
		EventsModule,
		HealthModule,
		InvoiceModule,
		LogModule,
		OnboardingModule,
		OrderModule,
		PhoneNumberModule,
		PlanModule,
		PromoCodeModule,
		RewardModule,
		SessionModule,
		SimModule,
		SubscriptionModule,
		SupportModule,
		TaxModule,
		TelcoModule,
		UserModule,
		VolumeModule,
		WalletModule,
		OfferModule,
		SettingsModule,
		DeviceModule,
		CountryModule,
	],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: LogMiddleware,
		},
		{
			provide: APP_PIPE,
			useValue: new CustomValidationPipe({
				transform: true,
				whitelist: true,
				forbidUnknownValues: true,
				forbidNonWhitelisted: true,
			}),
		},
		{
			provide: APP_INTERCEPTOR,
			inject: [Reflector],
			useFactory: (reflector: Reflector) =>
				new CustomClassSerializerInterceptor(reflector, {
					strategy: 'excludeAll',
					excludeExtraneousValues: true,
				}),
		},
		{
			provide: APP_GUARD,
			useClass: CustomThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: SessionGuard,
		},
		{
			provide: APP_GUARD,
			useClass: AccessGlobalGuard,
		},
	],
	controllers: [AppController],
})
export class AppModule implements NestModule, OnModuleInit, OnModuleDestroy {
	protected readonly logger = new Logger(AppModule.name);

	private store: PrismaSessionStore;

	constructor(
		private readonly db: DbService,
		private readonly config: ConfigService,
	) {}

	configure(consumer: MiddlewareConsumer) {
		consumer
			.apply(
				helmet({
					crossOriginEmbedderPolicy: false,
					contentSecurityPolicy: {
						directives: {
							imgSrc: [
								`'self'`,
								'data:',
								'apollo-server-landing-page.cdn.apollographql.com',
							],
							scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
							manifestSrc: [
								`'self'`,
								'apollo-server-landing-page.cdn.apollographql.com',
							],
							frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
						},
					},
				}),
			)
			.forRoutes('*');

		this.store = new PrismaSessionStore(this.db, {
			checkPeriod: 2 * 60 * 1000, //ms
			dbRecordIdIsSessionId: false,
			dbRecordIdFunction: () => randomUUID(),
			logger: new Logger(SessionModule.name),
			loggerLevel: 'log',
		});

		const isDev = this.config.getOrThrow<string>('ENV') === 'development';

		consumer
			.apply(
				session({
					name: 'fliggs',
					secret: this.config.getOrThrow<string>('SESSION_SECRET'),
					resave: false,
					saveUninitialized: false,
					cookie: {
						domain: this.config.getOrThrow<string>('SESSION_DOMAIN'),
						secure: !isDev,
					},
					store: this.store,
				}),
			)
			.forRoutes('*');
	}

	async onModuleInit() {}

	async onModuleDestroy() {
		await this.store.shutdown();
	}
}

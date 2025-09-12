import { forwardRef, Module } from '@nestjs/common';

import { AdminModule } from '@/admin/admin.module';
import { UserModule } from '@/user/user.module';
import { SessionModule } from '@/session/session.module';

import { LocalModule } from './local/local.module';
import { OpenIdModule } from './open-id/open-id.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthLoader } from './auth.loader';
import { AuthResolver } from './auth.resolver';
import { AuthAppleModule } from './apple/apple.module';
import { AuthGoogleModule } from './google/google.module';

@Module({
	imports: [
		forwardRef(() => AdminModule),
		forwardRef(() => UserModule),
		forwardRef(() => SessionModule),
		forwardRef(() => OpenIdModule),
		forwardRef(() => LocalModule),
		forwardRef(() => AuthAppleModule),
		forwardRef(() => AuthGoogleModule),
	],
	providers: [AuthService, AuthLoader, AuthResolver],
	controllers: [AuthController],
	exports: [AuthService, AuthLoader],
})
export class AuthModule {}

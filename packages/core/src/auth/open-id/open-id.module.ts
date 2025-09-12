import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { AdminModule } from '@/admin/admin.module';
import { SessionModule } from '@/session/session.module';

import { OpenIdService } from './open-id.service';
import { OpenIdController } from './open-id.controller';
import { OpenIdResolver } from './open-id.resolver';

@Module({
	imports: [
		forwardRef(() => UserModule),
		forwardRef(() => AdminModule),
		forwardRef(() => SessionModule),
	],
	providers: [OpenIdService, OpenIdResolver],
	controllers: [OpenIdController],
	exports: [OpenIdService],
})
export class OpenIdModule {}

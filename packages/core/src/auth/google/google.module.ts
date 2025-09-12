import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { AdminModule } from '@/admin/admin.module';
import { SessionModule } from '@/session/session.module';

import { AuthGoogleService } from './google.service';
import { AuthGoogleController } from './google.controller';

@Module({
	imports: [
		forwardRef(() => UserModule),
		forwardRef(() => AdminModule),
		forwardRef(() => SessionModule),
	],
	providers: [AuthGoogleService],
	controllers: [AuthGoogleController],
	exports: [AuthGoogleService],
})
export class AuthGoogleModule {}

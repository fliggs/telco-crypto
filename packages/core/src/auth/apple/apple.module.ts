import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '@/user/user.module';
import { AdminModule } from '@/admin/admin.module';
import { SessionModule } from '@/session/session.module';

import { AuthAppleService } from './apple.service';
import { AuthAppleController } from './apple.controller';

@Module({
	imports: [
		forwardRef(() => UserModule),
		forwardRef(() => AdminModule),
		forwardRef(() => SessionModule),
	],
	providers: [AuthAppleService],
	controllers: [AuthAppleController],
	exports: [AuthAppleService],
})
export class AuthAppleModule {}

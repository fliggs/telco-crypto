import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { UserModule } from '@/user/user.module';
import { AdminModule } from '@/admin/admin.module';

import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
	imports: [
		JwtModule.register({}),
		forwardRef(() => UserModule),
		forwardRef(() => AdminModule),
	],
	providers: [SessionService],
	exports: [SessionService],
	controllers: [SessionController],
})
export class SessionModule {}

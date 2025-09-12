import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from '@/auth/auth.module';

import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { AdminAuthDataResolver } from './auth-data.resolver';

@Module({
	imports: [forwardRef(() => AuthModule)],
	providers: [AdminService, AdminResolver, AdminAuthDataResolver],
	controllers: [],
	exports: [AdminService],
})
export class AdminModule {}

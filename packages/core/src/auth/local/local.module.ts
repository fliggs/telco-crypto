import { forwardRef, Module } from '@nestjs/common';

import { CrmModule } from '@/crm/crm.module';
import { AdminModule } from '@/admin/admin.module';
import { UserModule } from '@/user/user.module';
import { SessionModule } from '@/session/session.module';

import { LocalService } from './local.service';
import { LocalController } from './local.controller';
import { LocalResolver } from './local.resolver';

@Module({
	imports: [
		forwardRef(() => UserModule),
		forwardRef(() => AdminModule),
		forwardRef(() => SessionModule),
		forwardRef(() => CrmModule),
	],
	providers: [LocalService, LocalResolver],
	controllers: [LocalController],
	exports: [LocalService],
})
export class LocalModule {}

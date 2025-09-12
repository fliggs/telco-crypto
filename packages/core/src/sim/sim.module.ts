import { forwardRef, Module } from '@nestjs/common';

import { TelcoModule } from '@/telco/telco.module';
import { PlanModule } from '@/plan/plan.module';
import { SubscriptionModule } from '@/subscription/subscription.module';
import { VolumeModule } from '@/volume/volume.module';

import { SimService } from './sim.service';
import { SimResolver } from './sim.resolver';
import { SimLoader } from './sim.loader';
import { SimAssignmentResolver } from './sim-assignment.resolver';

@Module({
	imports: [
		forwardRef(() => TelcoModule),
		forwardRef(() => PlanModule),
		forwardRef(() => SubscriptionModule),
		forwardRef(() => VolumeModule),
	],
	providers: [SimService, SimResolver, SimLoader, SimAssignmentResolver],
	controllers: [],
	exports: [SimService, SimLoader],
})
export class SimModule {}

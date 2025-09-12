import { forwardRef, Module } from '@nestjs/common';

import { VolumeModule } from '@/volume/volume.module';

import { PlanService } from './plan.service';
import { PlanResolver } from './plan.resolver';
import { PlanLoader } from './plan.loader';
import { PlanTaxDataResolver } from './plan-tax-data.resolver';
import { PlanTelcoDataResolver } from './plan-telco-data.resolver';

@Module({
	imports: [forwardRef(() => VolumeModule)],
	providers: [
		PlanService,
		PlanResolver,
		PlanTelcoDataResolver,
		PlanTaxDataResolver,
		PlanLoader,
	],
	controllers: [],
	exports: [PlanService, PlanLoader],
})
export class PlanModule {}

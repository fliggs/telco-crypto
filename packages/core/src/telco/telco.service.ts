import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelcoProvider } from '@prisma/client';

import { DbService } from '@/db/db.service';
import { VolumeUsageDto } from '@/volume/dto/internal/volume-usage.dto';
import { SimDetailsDto } from '@/sim/dto/internal/sim-details.dto';
import { CheckAddressDto } from '@/address/dto/request/check-address.dto';
import { SubscriptionConfigDto } from '@/subscription/dto/internal/subscription-config.dto';

import { GetSimDetailsDto } from './dto/internal/get-sim-details.dto';
import { SubscriptionWithVolumes } from './dto/internal/get-sub-usage';
import { DeactivatePlanDto } from './dto/internal/deactivate-plan.dto';
import { ReactivatePlanDto } from './dto/internal/reactivate-plan.dto';
import { ChangeSimDto } from './dto/internal/change-sim.dto';
import { ChangeMsisdnDto } from './dto/internal/change-msisdn.dto';
import { ActivatePlanDto } from './dto/internal/activate-plan.dto';
import { TelcoResponseDto } from './dto/internal/telco-response.dto';
import {
	CheckPortInDto,
	CheckPortInResponseDto,
} from './dto/internal/check-portin.dto';
import {
	CheckCoverageDto,
	CheckCoverageResponseDto,
} from './dto/internal/check-coverage.dto';

@Injectable()
export abstract class TelcoService {
	protected readonly logger = new Logger(TelcoService.name);
	public abstract readonly provider: TelcoProvider;

	constructor(
		protected readonly config: ConfigService,
		private readonly db: DbService,
	) {}

	abstract checkCoverage(
		dto: CheckCoverageDto,
	): Promise<CheckCoverageResponseDto>;

	abstract checkAddress(dto: CheckAddressDto): Promise<void>;

	abstract checkPortIn(dto: CheckPortInDto): Promise<CheckPortInResponseDto>;

	abstract getSimDetails(dto: GetSimDetailsDto): Promise<SimDetailsDto>;

	abstract getSubscriptionConfig(
		sub: SubscriptionWithVolumes,
		childSubs: SubscriptionWithVolumes[],
	): Promise<SubscriptionConfigDto[]>;

	abstract getSubscriptionUsage(
		sub: SubscriptionWithVolumes,
		childSubs: SubscriptionWithVolumes[],
	): Promise<VolumeUsageDto[]>;

	abstract activatePlan(dto: ActivatePlanDto): Promise<TelcoResponseDto>;

	abstract deactivatePlan(dto: DeactivatePlanDto): Promise<TelcoResponseDto>;

	abstract reactivatePlan(dto: ReactivatePlanDto): Promise<TelcoResponseDto>;

	abstract changeSim(dto: ChangeSimDto): Promise<TelcoResponseDto>;

	abstract changePhoneNumber(dto: ChangeMsisdnDto): Promise<TelcoResponseDto>;

	protected async getPlanTelcoData<T>(planId: string): Promise<T | null> {
		const data = await this.db.planTelcoData.findUnique({
			where: {
				provider_planId: {
					provider: this.provider,
					planId,
				},
			},
		});
		return (data?.data as T) ?? null;
	}

	protected async setPlanTelcoData<T>(planId: string, data: T): Promise<void> {
		await this.db.planTelcoData.upsert({
			where: {
				provider_planId: {
					provider: this.provider,
					planId,
				},
			},
			create: {
				provider: this.provider,
				planId,
				data,
			},
			update: {
				data,
			},
		});
	}

	protected async getSubscriptionTelcoData<T>(
		subscriptionId: string,
	): Promise<T | null> {
		const data = await this.db.subscriptionTelcoData.findUnique({
			where: {
				provider_subscriptionId: {
					provider: this.provider,
					subscriptionId,
				},
			},
		});
		return (data?.data as T) ?? null;
	}

	protected async setSubscriptionTelcoData<T>(
		subscriptionId: string,
		data: T,
	): Promise<void> {
		await this.db.subscriptionTelcoData.upsert({
			where: {
				provider_subscriptionId: {
					provider: this.provider,
					subscriptionId,
				},
			},
			create: {
				provider: this.provider,
				subscriptionId,
				data,
			},
			update: {
				data,
			},
		});
	}

	protected async getSimTelcoData<T>(simIccid: string): Promise<T | null> {
		const data = await this.db.simTelcoData.findUnique({
			where: {
				provider_simIccid: {
					provider: this.provider,
					simIccid,
				},
			},
		});
		return (data?.data as T) ?? null;
	}

	protected async setSimTelcoData<T>(simIccid: string, data: T): Promise<void> {
		await this.db.simTelcoData.upsert({
			where: {
				provider_simIccid: {
					provider: this.provider,
					simIccid,
				},
			},
			create: {
				provider: this.provider,
				simIccid,
				data,
			},
			update: {
				data,
			},
		});
	}
}

import { Injectable } from '@nestjs/common';

import { TelcoProvider, VolumeType } from '@prisma/client';
import { DecimalNumber } from '@/decimal.dto';
import { TelcoService } from '@/telco/telco.service';
import { GetSimDetailsDto } from '@/telco/dto/internal/get-sim-details.dto';
import { VolumeUsageDto } from '@/volume/dto/internal/volume-usage.dto';
import { DeactivatePlanDto } from '@/telco/dto/internal/deactivate-plan.dto';
import { SimDetailsDto } from '@/sim/dto/internal/sim-details.dto';
import { CheckAddressDto } from '@/address/dto/internal/check-address.dto';
import { ChangeSimDto } from '@/telco/dto/internal/change-sim.dto';
import { ChangeMsisdnDto } from '@/telco/dto/internal/change-msisdn.dto';
import { ActivatePlanDto } from '@/telco/dto/internal/activate-plan.dto';
import { TelcoResponseDto } from '@/telco/dto/internal/telco-response.dto';
import { ReactivatePlanDto } from '@/telco/dto/internal/reactivate-plan.dto';
import { SubscriptionWithVolumes } from '@/telco/dto/internal/get-sub-usage';
import {
	CheckCoverageDto,
	CheckCoverageResponseDto,
} from '@/telco/dto/internal/check-coverage.dto';
import {
	CheckPortInDto,
	CheckPortInResponseDto,
} from '@/telco/dto/internal/check-portin.dto';
import { SubscriptionConfigDto } from '@/subscription/dto/internal/subscription-config.dto';

@Injectable()
export class TelcoMockService extends TelcoService {
	public readonly provider = TelcoProvider.MOCK;

	override async checkAddress(dto: CheckAddressDto): Promise<void> {}

	override async checkCoverage(
		dto: CheckCoverageDto,
	): Promise<CheckCoverageResponseDto> {
		return {
			coverage: Math.random(),
		};
	}

	override async checkPortIn(
		dto: CheckPortInDto,
	): Promise<CheckPortInResponseDto> {
		return {
			isEligible: true,
		};
	}

	override async getSimDetails(dto: GetSimDetailsDto): Promise<SimDetailsDto> {
		return {
			iccid: dto.iccid,
			type: dto.type,
			isActivated: Math.random() > 0.5,
			status: 'MOCK',
			eSimStatus: 'MOCK',
			eSimActivationCode: `1$fliggsmobile.com$${(Math.random() * 1_000_000_000_000).toFixed(0)}`,
		};
	}

	override async getSubscriptionConfig(
		sub: SubscriptionWithVolumes,
		childSubs: SubscriptionWithVolumes[],
	): Promise<SubscriptionConfigDto[]> {
		return [sub, ...childSubs].map((s) => ({
			config: { mock: true },
			subscriptionId: s.id,
		}));
	}

	override async getSubscriptionUsage(
		sub: SubscriptionWithVolumes,
		childSubs: SubscriptionWithVolumes[],
	): Promise<VolumeUsageDto[]> {
		const subs = [sub, ...childSubs];
		return subs.flatMap((sub) =>
			sub.offer.plan.volumes.map((v) => ({
				type: v.type,
				isRoaming: v.isRoaming,
				isUnlimited: v.isUnlimited,
				amountTotal: v.amount,
				amountUsed: v.amount.mul(Math.random()),
				subscriptionId: sub.id,
			})),
		);
	}

	override async activatePlan(dto: ActivatePlanDto): Promise<TelcoResponseDto> {
		return {
			iccid:
				dto.iccid ??
				new DecimalNumber('1000000000000000000').mul(Math.random()).toFixed(0),
			msisdn: dto.msisdn
				? dto.msisdn
				: `079${(Math.random() * 10000000).toFixed(0)}`,
		};
	}

	override async deactivatePlan(
		dto: DeactivatePlanDto,
	): Promise<TelcoResponseDto> {
		return {
			iccid: dto.iccid,
			msisdn: dto.msisdn,
		};
	}

	override async reactivatePlan(
		dto: ReactivatePlanDto,
	): Promise<TelcoResponseDto> {
		return {
			iccid: dto.iccid,
			msisdn: dto.msisdn,
		};
	}

	override async changeSim(dto: ChangeSimDto): Promise<TelcoResponseDto> {
		return {
			iccid: dto.newIccid,
			msisdn: dto.msisdn,
		};
	}

	override async changePhoneNumber(
		dto: ChangeMsisdnDto,
	): Promise<TelcoResponseDto> {
		return {
			iccid: dto.iccid,
			msisdn: dto.newMsisdn ?? `079${(Math.random() * 10000000).toFixed(0)}`,
		};
	}
}

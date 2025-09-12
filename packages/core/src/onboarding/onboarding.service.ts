import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	OnboardingProgress,
	OnboardingStageType,
	OrderStatus,
	OrderType,
} from '@prisma/client';

import { DbService } from '@/db/db.service';
import { BillingService } from '@/billing/billing.service';
import { EventsService } from '@/events/events.service';
import { FINAL_STATI } from '@/order/order.service';

import { OnboardingDataAddressDto } from './dto/response/onboarding-data-address.dto';
import { OnboardingDataOrderConfirmDto } from './dto/response/onboarding-data-order-confirm.dto';
import {
	ONBOARDING_EVENT_COMPLETED,
	ONBOARDING_EVENT_STARTED,
} from './onboarding.events';

@Injectable()
export class OnboardingService {
	constructor(
		private readonly db: DbService,
		private readonly billingService: BillingService,
		private readonly events: EventsService,
	) {}

	async findAllPublicStages() {
		return this.db.onboardingStage.findMany({
			orderBy: [
				{
					sort: 'asc',
				},
			],
		});
	}

	async findAllStages() {
		return this.db.onboardingStage.findMany({
			orderBy: [
				{
					sort: 'asc',
				},
			],
		});
	}

	async findOne(name: string) {
		const stage = await this.db.onboardingStage.findUnique({
			where: {
				name,
			},
		});
		if (!stage) {
			throw new NotFoundException('stage_not_found');
		}
		return stage;
	}

	async mapProgressByUserId(ids: string[]) {
		const progresses = await this.db.onboardingProgress.findMany({
			where: {
				userId: { in: ids },
			},
		});
		const map: Map<string, OnboardingProgress[]> = new Map();
		for (const progress of progresses) {
			let userProgress = map.get(progress.userId);
			if (!userProgress) {
				userProgress = [];
				map.set(progress.userId, userProgress);
			}
			userProgress.push(progress);
		}
		return map;
	}

	async getProgressByUser(userId: string) {
		return this.db.onboardingProgress.findMany({
			where: {
				userId: userId,
			},
			orderBy: [
				{
					stage: {
						sort: 'asc',
					},
				},
			],
		});
	}

	async changeProgress(userId: string, stageName: string, completed: boolean) {
		const stage = await this.db.onboardingStage.findUnique({
			where: {
				name: stageName,
			},
		});

		if (!stage) {
			throw new NotFoundException('onboarding_stage_not_found');
		}

		const progress = await this.db.onboardingProgress.findUnique({
			where: {
				userId_stageName: {
					userId,
					stageName,
				},
			},
		});

		if (progress && progress.completedAt && !completed) {
			throw new BadRequestException('stage_already_completed');
		}

		if (completed) {
			switch (stage.type) {
				case OnboardingStageType.ADDRESS: {
					const data = stage.data as OnboardingDataAddressDto;
					// TODO: Direct db access from wrong service
					const addr = await this.db.address.findFirst({
						where: {
							userId,
							type: data.addressType,
						},
					});
					if (!addr) {
						throw new BadRequestException(`missing_address:${data.type}`);
					}
					break;
				}

				case OnboardingStageType.PAYMENT: {
					await this.billingService.checkUserSetupComplete(userId);
					break;
				}

				case OnboardingStageType.ORDER_PLAN: {
					// TODO: Direct db access from wrong service
					const order = await this.db.order.findFirst({
						where: {
							type: OrderType.ADD_PLAN,
							status: OrderStatus.DRAFT,
							userId,
						},
						include: {
							addPlan: true,
						},
					});
					if (!order) {
						throw new BadRequestException('missing_order');
					}
					if (!order.addPlan?.offerId) {
						throw new BadRequestException(`missing_order_offer`);
					}
					break;
				}

				case OnboardingStageType.ORDER_MSISDN: {
					// TODO: Direct db access from wrong service
					const order = await this.db.order.findFirst({
						where: {
							type: OrderType.ADD_PLAN,
							status: OrderStatus.DRAFT,
							userId,
						},
						include: {
							addPlan: true,
						},
					});
					if (!order) {
						throw new BadRequestException('missing_order');
					}
					// TODO: This check does nothing
					break;
				}

				case OnboardingStageType.ORDER_SIM_TYPE: {
					// TODO: Direct db access from wrong service
					const order = await this.db.order.findFirst({
						where: {
							type: OrderType.ADD_PLAN,
							status: OrderStatus.DRAFT,
							userId,
						},
						include: {
							addPlan: true,
						},
					});
					if (!order) {
						throw new BadRequestException('missing_order');
					}
					if (!order.addPlan?.simType) {
						throw new BadRequestException(`missing_order_sim_type`);
					}
					break;
				}

				case OnboardingStageType.ORDER_CONFIRM: {
					const data = stage.data as OnboardingDataOrderConfirmDto;
					const stages = await this.db.onboardingStage.findMany({
						where: {
							name: {
								in: data.stages,
							},
						},
					});
					const progress = await this.db.onboardingProgress.findMany({
						where: {
							userId,
						},
					});
					const missing = stages.filter(
						(s) =>
							!progress.some((p) => s.name === p.stageName && !!p.completedAt),
					);
					if (missing.length > 0) {
						throw new BadRequestException(
							`stages_not_complete:${missing.map((s) => s.name).join(',')}`,
						);
					}

					if (data.payment) {
						await this.billingService.checkUserSetupComplete(userId);
					}

					const order = await this.db.order.findFirst({
						where: {
							type: OrderType.ADD_PLAN,
							userId,
						},
					});
					if (!order) {
						throw new BadRequestException('missing_order');
					}
					if (order.status === OrderStatus.DRAFT) {
						throw new BadRequestException('order_not_confirmed');
					}
					break;
				}

				case OnboardingStageType.ORDER_PROCESS: {
					// TODO: Direct db access from wrong service
					const order = await this.db.order.findFirst({
						where: {
							type: OrderType.ADD_PLAN,
							userId,
						},
					});

					if (!order) {
						throw new BadRequestException('missing_order');
					}

					if (
						!FINAL_STATI.has(order.status) &&
						order.status !== OrderStatus.ERROR // We also let the user continue if the order errored
					) {
						throw new BadRequestException('order_not_complete');
					}
					break;
				}

				case OnboardingStageType.KYC: {
					// TODO
					break;
				}
			}
		}

		const newProgress = await this.db.onboardingProgress.upsert({
			where: {
				userId_stageName: {
					userId,
					stageName,
				},
			},
			create: {
				userId,
				stageName,
				startedAt: new Date(),
				completedAt: completed ? new Date() : null,
			},
			update: {
				startedAt: completed ? undefined : new Date(),
				completedAt: completed ? new Date() : null,
			},
		});

		if (completed) {
			this.events.emit(ONBOARDING_EVENT_COMPLETED, { userId, stageName });
		} else {
			this.events.emit(ONBOARDING_EVENT_STARTED, { userId, stageName });
		}

		return newProgress;
	}

	async setProgress(
		userId: string,
		stageName: string,
		startedAt: Date | null,
		completedAt: Date | null,
	) {
		const stage = await this.db.onboardingStage.findUnique({
			where: {
				name: stageName,
			},
		});

		if (!stage) {
			throw new NotFoundException('onboarding_stage_not_found');
		}

		const progress = await this.db.onboardingProgress.upsert({
			where: {
				userId_stageName: {
					userId,
					stageName,
				},
			},
			create: {
				userId,
				stageName,
				startedAt,
				completedAt,
			},
			update: {
				startedAt,
				completedAt,
			},
		});

		if (completedAt) {
			this.events.emit(ONBOARDING_EVENT_COMPLETED, { userId, stageName });
		} else if (startedAt) {
			this.events.emit(ONBOARDING_EVENT_STARTED, { userId, stageName });
		}

		return progress;
	}
}

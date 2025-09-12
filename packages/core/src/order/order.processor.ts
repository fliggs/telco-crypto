import {
	Order,
	OrderAction,
	OrderAddPlanDetails,
	OrderChangePhoneNumberDetails,
	OrderChangePlanDetails,
	OrderChangeSimDetails,
	OrderDeactivatePlanDetails,
	OrderPortOutDetails,
	OrderReactivatePlanDetails,
	OrderRenewPlanDetails,
	OrderRun,
	OrderRunStepStatus,
	OrderStep,
	OrderStepStatus,
} from '@prisma/client';

import { DbService } from '@/db/db.service';

import { Step } from './dto/internal/step.dto';
import { Logger } from '@nestjs/common';

export type ProcessorResult = { runAt: Date } | { result: any } | void;

export interface StepDescription {
	stepNo: number;
	type: string;
}

export interface OrderWithDetails extends Order {
	addPlan: OrderAddPlanDetails | null;
	renewPlan: OrderRenewPlanDetails | null;
	changePlan: OrderChangePlanDetails | null;
	deactivatePlan: OrderDeactivatePlanDetails | null;
	reactivatePlan: OrderReactivatePlanDetails | null;
	changeSim: OrderChangeSimDetails | null;
	changePhoneNumber: OrderChangePhoneNumberDetails | null;
	portOut: OrderPortOutDetails | null;
}

export abstract class OrderProcessor {
	protected readonly logger = new Logger(OrderProcessor.name);

	protected abstract readonly steps: Step<unknown>[];

	constructor(protected readonly db: DbService) {}

	public getSteps(): StepDescription[] {
		return this.steps.map((step, i) => ({ stepNo: i, type: step.name }));
	}

	public async process(
		order: OrderWithDetails,
		orderSteps: OrderStep[],
		run: OrderRun,
	): Promise<ProcessorResult> {
		let res: any = null;

		const doRun = run.action === OrderAction.RUN;
		const steps = orderSteps
			.sort((s) => s.stepNo)
			.map((step) => this.steps.find((s) => s.name === step.type)!);

		let i = run.stepNo ?? (doRun ? 0 : steps.length - 1);
		const end = doRun ? steps.length : -1;
		const inc = doRun ? 1 : -1;

		while (i !== end) {
			const step = steps[i];
			this.logger.debug(
				`Order ${order.id}, Run ${run.id}, Step ${i}: ${step.name}`,
			);

			await this.startStep(run, i);

			res = await (doRun ? step.run(order, run) : step.abort(order, run));

			// If we are not at the last step, then increment the step:
			//   Depending on `doRun`, the following expression evaluates to either:
			//     · (this.steps.length - 1)     # the last step when incrementing
			//     · (-1 - -1)                   # the last step when decrementing
			// Otherwise, we set the step to `null`
			const nextI = i !== end - inc ? i + inc : null;
			await this.completeStep(run, i, nextI, res);

			if (res && 'runAt' in res) {
				return res;
			}

			i += inc;
		}

		return res;
	}

	protected async startStep(run: OrderRun, stepNo: number) {
		return this.db.$transaction([
			this.db.order.update({
				where: {
					id: run.orderId,
				},
				data: {
					stepNo: stepNo,
				},
			}),
			this.db.orderStep.update({
				where: {
					orderId_stepNo: {
						orderId: run.orderId,
						stepNo,
					},
				},
				data: {
					status: OrderStepStatus.PROCESSING,
					startedAt: new Date(),
				},
			}),
			this.db.orderRun.update({
				where: {
					id: run.id,
				},
				data: {
					stepNo: stepNo,
				},
			}),
			this.db.orderRunStep.update({
				where: {
					runId_stepNo: {
						runId: run.id,
						stepNo: stepNo,
					},
				},
				data: {
					status: OrderRunStepStatus.PROCESSING,
					startedAt: new Date(),
				},
			}),
		]);
	}

	protected async completeStep(
		run: OrderRun,
		stepNo: number,
		newStepNo: number | null,
		result?: any,
	) {
		return this.db.$transaction([
			this.db.order.update({
				where: {
					id: run.orderId,
				},
				data: {
					stepNo: newStepNo,
				},
			}),
			this.db.orderStep.update({
				where: {
					orderId_stepNo: {
						orderId: run.orderId,
						stepNo: stepNo,
					},
				},
				data: {
					status: OrderStepStatus.DONE,
					completedAt: new Date(),
					result,
				},
			}),
			this.db.orderRun.update({
				where: {
					id: run.id,
				},
				data: {
					stepNo: newStepNo,
					result,
				},
			}),
			this.db.orderRunStep.update({
				where: {
					runId_stepNo: {
						runId: run.id,
						stepNo: stepNo,
					},
				},
				data: {
					status: OrderRunStepStatus.DONE,
					completedAt: new Date(),
					result,
				},
			}),
		]);
	}
}

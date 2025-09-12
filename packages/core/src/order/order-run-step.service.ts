import { Injectable, Logger } from '@nestjs/common';
import { OrderRunStep } from '@prisma/client';

import { DbService } from '@/db/db.service';

@Injectable()
export class OrderRunStepService {
	protected readonly logger = new Logger(OrderRunStepService.name);

	constructor(private readonly db: DbService) {}

	async mapByRunId(ids: string[]) {
		const steps = await this.db.orderRunStep.findMany({
			where: {
				runId: { in: ids },
			},
			orderBy: [
				{
					runId: 'asc',
				},
				{
					stepNo: 'asc',
				},
			],
		});
		const map: Map<string, OrderRunStep[]> = new Map();
		for (const step of steps) {
			let runSteps = map.get(step.runId);
			if (!runSteps) {
				runSteps = [];
				map.set(step.runId, runSteps);
			}
			runSteps.push(step);
		}
		return map;
	}

	async mapCurrentByRunId(ids: [string, number][]) {
		const steps = await this.db.orderRunStep.findMany({
			where: {
				OR: ids.map(([runId, stepNo]) => ({ runId, stepNo })),
			},
		});
		const map: Map<string, OrderRunStep> = new Map();
		for (const step of steps) {
			map.set(step.runId, step);
		}
		return map;
	}
}

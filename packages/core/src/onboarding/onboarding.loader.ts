import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { OnboardingProgress } from '@prisma/client';

import { OnboardingService } from './onboarding.service';

@Injectable({ scope: Scope.REQUEST })
export class OnboardingLoader {
	constructor(private readonly onboardingService: OnboardingService) {}

	public readonly progressByUser = new DataLoader<string, OnboardingProgress[]>(
		async (keys: readonly string[]) => {
			const map = await this.onboardingService.mapProgressByUserId([...keys]);
			return keys.map((key) => map.get(key) ?? []);
		},
	);
}

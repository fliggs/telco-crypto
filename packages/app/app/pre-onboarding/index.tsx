import { PublicOnboardingProgressDto } from "api-client-ts";
import { router } from "expo-router";
import { useEffect } from "react";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";

export default function PreOnboardingIndex() {
  const { optionalStages } = useOnboardingStages();
  const { progressByStage } = useOnboardingProgress();

  useEffect(() => {
    // Set initial onboarding stage as base
    const baseStage = optionalStages[0];
    router.replace({
      pathname: `/pre-onboarding/${baseStage.type}` as any, // TODO: provide a screen for every type
      params: { stage: baseStage.name },
    });

    let prevProgress: PublicOnboardingProgressDto | null = null;
    for (let i = 1; i < optionalStages.length; i++) {
      const stage = optionalStages[i];
      const progress = progressByStage[stage.name];
      if (progress?.startedAt || prevProgress?.completedAt) {
        router.push({
          pathname: `/pre-onboarding/${stage.type}` as any, // TODO: provide a screen for every type
          params: { stage: stage.name },
        });
      } else {
        break;
      }
      prevProgress = progress;
    }
  }, []);

  return null;
}

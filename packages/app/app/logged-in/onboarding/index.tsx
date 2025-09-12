import { PublicOnboardingProgressDto } from "api-client-ts";
import { router } from "expo-router";
import { useEffect } from "react";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";

export default function OnboardingIndex() {
  const { requiredStages } = useOnboardingStages();
  const { progressByStage } = useOnboardingProgress();

  useEffect(() => {
    // Set initial onboarding stage as base
    const baseStage = requiredStages[0];
    router.replace({
      pathname: `/logged-in/onboarding/${baseStage.type}`,
      params: { stage: baseStage.name },
    });

    let prevProgress: PublicOnboardingProgressDto | null = null;
    for (let i = 1; i < requiredStages.length; i++) {
      const stage = requiredStages[i];
      const progress = progressByStage[stage.name];
      if (progress?.startedAt || prevProgress?.completedAt) {
        router.push({
          pathname: `/logged-in/onboarding/${stage.type}`,
          params: { stage: stage.name },
        });
      } else {
        break;
      }
      prevProgress = progress;
    }
  }, [requiredStages, progressByStage]);

  return null;
}

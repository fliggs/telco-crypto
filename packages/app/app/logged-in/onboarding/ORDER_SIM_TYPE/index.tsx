import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { checkESimSupport } from "@/util";
import SimSelection from "@/components/SimSelection";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingOrderSimType() {
  const { showError } = useErrorSheet();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { requiredStages } = useOnboardingStages();
  const { startStage } = useOnboardingProgress();

  const currentStage = useMemo(
    () => requiredStages.find((s) => s.name === stage),
    [requiredStages, stage]
  );

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  const onContinue = useCallback(
    async (device: "this" | "other" | "existing") => {
      try {
        if (device === "this") {
          const res = await checkESimSupport();
          if (typeof res === "boolean") {
            router.push({
              pathname: `/logged-in/onboarding/ORDER_SIM_TYPE/esim`,
              params: { stage, supported: `${res}`, phone: "this" },
            });
          }
        } else if (device === "other") {
          router.push({
            pathname: `/logged-in/onboarding/ORDER_SIM_TYPE/manual`,
            params: { stage },
          });
        } else if (device === "existing") {
          router.push({
            pathname: `/logged-in/onboarding/ORDER_SIM_TYPE/scan`,
            params: { stage },
          });
        }
      } catch (err) {
        showError({ error: err });
      }
    },
    [stage]
  );

  if (!currentStage) {
    return null;
  }

  return (
    <SafeView dark>
      <OnboardingHeader />

      <SimSelection onContinue={onContinue} />
    </SafeView>
  );
}

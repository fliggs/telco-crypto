import { useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import SimSelectionManual from "@/components/SimSelectionManual";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingOrderSimTypeManual() {
  const { showError } = useErrorSheet();
  const { stage } = useLocalSearchParams<{ stage: string }>();

  const onContinue = useCallback(
    (supported: boolean | "existing") => {
      if (supported === true) {
        router.push({
          pathname: `/logged-in/onboarding/ORDER_SIM_TYPE/esim`,
          params: { stage, supported: "true", phone: "other" },
        });
      } else if (supported === false) {
        router.push({
          pathname: `/logged-in/onboarding/ORDER_SIM_TYPE/shipping`,
          params: { stage },
        });
      } else {
        showError({
          error: "Please select whether your device supports eSIM.",
        });
      }
    },
    [showError, stage]
  );

  return (
    <SafeView dark>
      <OnboardingHeader />
      <SimSelectionManual onContinue={onContinue} />
    </SafeView>
  );
}

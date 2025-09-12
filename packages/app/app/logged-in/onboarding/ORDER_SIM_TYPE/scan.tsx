import React, { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { SimType } from "api-client-ts";

import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";
import SimCardScanScreen from "@/components/SimCardScanScreen";

export default function OnboardingOrderSimTypeScan() {
  const { showError } = useErrorSheet();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { update } = useCurrentOrder();
  const { completeStage } = useOnboardingProgress();

  const onContinue = useCallback(
    async (iccid: string) => {
      try {
        await update({ simSelection: { simType: SimType.PSim, iccid } });
        await completeStage(stage);
      } catch (err) {
        showError({ error: err });
      }
    },
    [update, completeStage]
  );

  return (
    <SafeView dark>
      <OnboardingHeader />

      <SimCardScanScreen onContinue={onContinue} />
    </SafeView>
  );
}

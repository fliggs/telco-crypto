import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import MsisdnSelectionStep2 from "@/components/MsisdnSelectionStep2";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingOrderMsisdnStep2() {
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { requiredStages } = useOnboardingStages();
  const { update } = useCurrentOrder();
  const { showError } = useErrorSheet();

  const currentStage = useMemo(
    () => requiredStages.find((s) => s.name === stage),
    [requiredStages, stage]
  );

  const onContinue = useCallback(
    async (num: string) => {
      try {
        await update({
          portIn: { isPortingIn: true, msisdn: num },
        });

        router.push({
          pathname: `/logged-in/onboarding/ORDER_MSISDN/step3`,
          params: { stage, num },
        });
      } catch (err) {
        showError({
          error: err,
        });
      }
    },
    [showError, update, stage]
  );

  if (!currentStage) {
    return null;
  }

  return (
    <SafeView dark>
      <OnboardingHeader />
      <MsisdnSelectionStep2 onContinue={onContinue} />
    </SafeView>
  );
}

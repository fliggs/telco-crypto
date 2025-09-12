import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";

import MsisdnSelection from "@/components/MsisdnSelection";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingOrderMsisdn() {
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { update } = useCurrentOrder();
  const { requiredStages } = useOnboardingStages();
  const { startStage, completeStage } = useOnboardingProgress();

  const currentStage = useMemo(
    () => requiredStages.find((s) => s.name === stage),
    [requiredStages, stage]
  );

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  const onContinue = useCallback(
    async (option: "new" | "bring") => {
      if (option === "bring") {
        router.push({
          pathname: `/logged-in/onboarding/ORDER_MSISDN/step2`,
          params: { stage },
        });
      } else if (option === "new") {
        await update({ portIn: { isPortingIn: false } });
        await completeStage(stage);
      }
    },
    [completeStage, stage, update]
  );

  if (!currentStage) {
    return null;
  }

  return (
    <SafeView dark>
      <OnboardingHeader />
      <MsisdnSelection onContinue={onContinue} />
    </SafeView>
  );
}

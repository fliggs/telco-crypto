import { useLocalSearchParams } from "expo-router";
import { useCallback, useMemo } from "react";

import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";

import MsisdnSelectionStep3 from "@/components/MsisdnSelectionStep3";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingOrderMsisdnStep3() {
  const { stage, num } = useLocalSearchParams<{ stage: string; num: string }>();
  const { requiredStages } = useOnboardingStages();
  const { update } = useCurrentOrder();
  const { completeStage } = useOnboardingProgress();

  const currentStage = useMemo(
    () => requiredStages.find((s) => s.name === stage),
    [requiredStages, stage]
  );

  const onContinue = useCallback(
    async (
      doLater: boolean,
      ospAccountId: string,
      ospPostalCode: string,
      ospPassword: string
    ) => {
      await update({
        portIn: {
          isPortingIn: !doLater,
          msisdn: num,
          accountNumber: ospAccountId,
          postalCode: ospPostalCode,
          password: ospPassword,
        },
      });
      await completeStage(stage);
    },
    [update, completeStage, stage, num]
  );

  if (!currentStage) {
    return null;
  }

  return (
    <SafeView dark>
      <OnboardingHeader />
      <MsisdnSelectionStep3 onContinue={onContinue} />
    </SafeView>
  );
}

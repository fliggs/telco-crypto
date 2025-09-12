import { useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { SimType } from "api-client-ts";

import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import SimSelectionESim from "@/components/SimSelectionESim";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingOrderSimTypeESim() {
  const { stage, phone, supported } = useLocalSearchParams<{
    stage: string;
    phone: "this" | "other";
    supported: "true" | "false";
  }>();
  const { update } = useCurrentOrder();
  const { completeStage } = useOnboardingProgress();

  const onPress = useCallback(async () => {
    await update({ simSelection: { simType: SimType.ESim } });
    await completeStage(stage);
  }, [completeStage, stage]);

  return (
    <SafeView dark>
      <OnboardingHeader />
      <SimSelectionESim
        esimSupported={supported === "true"}
        thisPhone={phone === "this"}
        onContinue={onPress}
      />
    </SafeView>
  );
}

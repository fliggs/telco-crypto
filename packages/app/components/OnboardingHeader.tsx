import { View } from "react-native";
import { router, useGlobalSearchParams } from "expo-router";
import { useMemo } from "react";

import { Spacing } from "@/constants";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import { useMe } from "@/providers/MeProvider";

import SvgChevronLeft from "@/assets/icons/chevron-left.svg";

import Button, { ButtonType } from "./Button";
import ProgressBar from "./ProgressBar";

export default function OnboardingHeader() {
  const { signOut } = useMe();
  const { stage } = useGlobalSearchParams<{ stage: string }>();
  const { requiredStages } = useOnboardingStages();

  const selectedStageIdx = useMemo(
    () => requiredStages.findIndex((s) => s.name === stage),
    [requiredStages, stage]
  );

  const max = useMemo(
    () => requiredStages.filter((s) => s.data?.showInProgress !== false).length,
    [requiredStages]
  );

  const progress = useMemo(() => {
    let progress = selectedStageIdx;
    for (let i = 0; i <= selectedStageIdx; i++) {
      if (requiredStages[i].data?.showInProgress === false) {
        progress--;
      }
    }
    return progress;
  }, [requiredStages, selectedStageIdx]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
      }}
    >
      <Button
        style={{ marginLeft: -Spacing.SMALL, marginTop: -Spacing.SMALL }}
        compact
        type={ButtonType.TRANSPARENT}
        onPress={() => (selectedStageIdx > 0 ? router.back() : signOut())}
      >
        <SvgChevronLeft color="white" />
      </Button>

      <ProgressBar
        value={progress}
        max={max}
        containerStyle={{ marginBottom: Spacing.SMALL }}
      />
    </View>
  );
}

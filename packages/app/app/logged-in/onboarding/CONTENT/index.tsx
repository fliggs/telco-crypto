import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { Image, View } from "react-native";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import { Color, getColor, getSpacing, Spacing } from "@/constants";
import { getImage } from "@/util";
import Text, { getTextVariant, TextVariant } from "@/components/Text";
import OnboardingSeparator from "@/components/OnboardingSeperator";
import Button from "@/components/Button";
import { useTranslation } from "@/node_modules/react-i18next";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingContent() {
  const { t } = useTranslation();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { requiredStages } = useOnboardingStages();
  const { startStage, completeStage } = useOnboardingProgress();

  const currentStage = useMemo(
    () => requiredStages.find((s) => s.name === stage),
    [requiredStages, stage]
  );

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  const onDone = useCallback(async () => {
    await completeStage(stage);
  }, [completeStage, stage]);

  if (!currentStage) {
    return null;
  }

  return (
    <SafeView dark>
      <OnboardingHeader />
      {currentStage.content.details?.map((block, i) => (
        <React.Fragment key={i}>
          {block.type === "text" ? (
            <Text
              variant={getTextVariant(block.variant, TextVariant.BodyLarge)}
              color={getColor(block.color, Color.WHITE)}
            >
              {block.text}
            </Text>
          ) : block.type === "list" ? (
            block.items.map((item, i) => (
              <React.Fragment key={i}>
                <Text
                  variant={getTextVariant(block.variant, TextVariant.BodyLarge)}
                  color={getColor(block.color, Color.WHITE)}
                >
                  {item}
                </Text>

                {i < block.items.length && (
                  <OnboardingSeparator
                    color={getColor(block.color, Color.WHITE)}
                  />
                )}
              </React.Fragment>
            ))
          ) : block.type === "image" ? (
            <Image
              source={getImage(block.image)}
              style={{ width: "100%" }}
              resizeMode="contain"
            />
          ) : block.type === "separator" ? (
            <OnboardingSeparator color={getColor(block.color, Color.WHITE)} />
          ) : block.type === "spacer" ? (
            <View
              collapsable={false}
              style={{
                marginBottom: getSpacing(block.spacing, Spacing.SMALL),
              }}
            />
          ) : null}
        </React.Fragment>
      ))}

      <View style={{ flex: 1 }} />

      <Button onPress={onDone}>{t("global.button-continue")}</Button>
    </SafeView>
  );
}

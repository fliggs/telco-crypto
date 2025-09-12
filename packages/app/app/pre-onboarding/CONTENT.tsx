import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo } from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { Color, getColor, getSpacing, Spacing } from "@/constants";
import { getImage } from "@/util";
import Button, { ButtonType } from "@/components/Button";
import Text, { getTextVariant, TextVariant } from "@/components/Text";
import Stepper from "@/components/OnboardingStepper";
import OnboardingSeparator from "@/components/OnboardingSeperator";
import BackgroundImage from "@/components/BackgroundImage";

import BackIcon from "@/assets/icons/back.svg";
import { useTranslation } from "@/node_modules/react-i18next";

export default function PreOnboardingContent() {
  const { t } = useTranslation();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { optionalStages } = useOnboardingStages();
  const { startStage, completeStage } = useOnboardingProgress();
  const insets = useSafeAreaInsets();

  const selectedStageIdx = useMemo(
    () => optionalStages.findIndex((s) => s.name === stage),
    [optionalStages, stage]
  );

  const currentStage = useMemo(
    () => optionalStages[selectedStageIdx],
    [optionalStages, selectedStageIdx]
  );

  const max = useMemo(
    () => optionalStages.filter((s) => s.data?.showInProgress !== false).length,
    [optionalStages]
  );

  const progress = useMemo(() => {
    let progress = selectedStageIdx;
    for (let i = 0; i <= selectedStageIdx; i++) {
      if (optionalStages[i].data?.showInProgress === false) {
        progress--;
      }
    }
    return progress;
  }, [optionalStages, selectedStageIdx]);

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  const onDone = useCallback(async () => {
    await completeStage(stage);
  }, [completeStage, stage]);

  const onSkip = useCallback(async () => {
    for (const stage of optionalStages) {
      await completeStage(stage.name, false);
    }
    router.replace("/sign-in");
  }, [completeStage, optionalStages]);

  const contentColor = useMemo(
    () => getColor(currentStage.content.color, Color.WHITE),
    [currentStage]
  );

  if (!currentStage) {
    return null;
  }

  return (
    <BackgroundImage image={currentStage.content.bgImage}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: Spacing.MEDIUM,
        }}
      >
        <View style={{ gap: Spacing.MEDIUM }}>
          {selectedStageIdx > 0 && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginBottom: Spacing.MEDIUM }}
            >
              <BackIcon width={24} height={24} color={contentColor} />
            </TouchableOpacity>
          )}

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
                      variant={getTextVariant(
                        block.variant,
                        TextVariant.BodyLarge
                      )}
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
                <OnboardingSeparator
                  color={getColor(block.color, Color.WHITE)}
                />
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
        </View>

        <View>
          <Stepper
            currentStep={progress + 1}
            totalSteps={max}
            primaryColor={contentColor !== Color.PETROL}
          />

          <Button
            style={{ marginBottom: 10 }}
            type={
              contentColor === Color.BLACK
                ? ButtonType.SECONDARY
                : ButtonType.PRIMARY
            }
            onPress={onDone}
          >
            {t("global.button-next")}
          </Button>

          <Button
            type={
              contentColor === Color.BLACK
                ? ButtonType.TRANSPARENT_BORD_BLACK
                : ButtonType.TRANSPARENT_BORD
            }
            textColor={contentColor}
            onPress={onSkip}
          >
            {t("global.button-skip")}
          </Button>
        </View>
      </View>
    </BackgroundImage>
  );
}

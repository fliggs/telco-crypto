import React, { useCallback } from "react";
import { View, ImageBackground, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import * as TrackingTransparency from "expo-tracking-transparency";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Color, Spacing } from "@/constants";
import Button, { ButtonType } from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";

import BackIcon from "@/assets/icons/back.svg";

interface Props {
  onComplete: () => void;
}

export default function ConsentScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets();

  const handleComplete = useCallback(async () => {
    await TrackingTransparency.requestTrackingPermissionsAsync();
    onComplete();
  }, [onComplete]);

  return (
    <ImageBackground
      style={{ width: "100%", height: "100%" }}
      resizeMode="cover"
    >
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: Spacing.MEDIUM,
        }}
      >
        <View>
          <TouchableOpacity onPress={() => router.back()}>
            <BackIcon width={24} height={24} fill={Color.WHITE} />
          </TouchableOpacity>

          <Text
            style={{ marginTop: Spacing.LARGE, marginBottom: Spacing.MEDIUM }}
            variant={TextVariant.H3}
            color={Color.WHITE}
          >
            {"Help us \nimprove."}
          </Text>

          <View
            style={{ backgroundColor: Color.DARK, padding: Spacing.MEDIUM }}
          >
            <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
              We use your data to enhance your experience with our products,
              offering tailored services and exclusive promotions to help you
              get the most out of mobile Inc.
            </Text>
          </View>
        </View>

        <View>
          <Button
            style={{ marginBottom: 10 }}
            type={ButtonType.PRIMARY}
            onPress={handleComplete}
          >
            Continue
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
}

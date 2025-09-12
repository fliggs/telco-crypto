import { View } from "react-native";
import React, { useCallback, useState } from "react";

import { Color, Spacing } from "@/constants";

import Text, { TextVariant } from "./Text";
import SelectableCard, { CardVariant } from "./SelectableCard";
import Button from "./Button";
import { Pressable } from "react-native-gesture-handler";

interface Props {
  onContinue: (selectedDevice: "this" | "other" | "existing") => void;
}

export default function SimSelection({ onContinue }: Props) {
  const [selectedDevice, setSelectedDevice] = useState<
    "this" | "other" | "existing"
  >();

  const handleContinue = useCallback(() => {
    if (!selectedDevice) {
      return;
    }

    onContinue(selectedDevice);
  }, [onContinue, selectedDevice]);

  return (
    <>
      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Select your device.
      </Text>
      <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
        On which phone do you plan to use the mobile SIM?
      </Text>

      <View style={{ gap: Spacing.SMALL }}>
        <SelectableCard
          title="This phone"
          variant={CardVariant.SECONDARY}
          selected={selectedDevice === "this"}
          onPress={() => setSelectedDevice("this")}
        />
        <SelectableCard
          title="Another phone"
          variant={CardVariant.SECONDARY}
          selected={selectedDevice === "other"}
          onPress={() => setSelectedDevice("other")}
        />
      </View>

      <View style={{ flex: 1 }} collapsable={false} />

      <Pressable onPress={() => onContinue("existing")}>
        <Text variant={TextVariant.Link}>I already have a SIM {">"}</Text>
      </Pressable>

      <Button
        onPress={handleContinue}
        enabled={typeof selectedDevice === "string"}
      >
        Continue
      </Button>
    </>
  );
}

import React, { useMemo } from "react";
import { ImageBackground, StatusBar, StyleSheet, View } from "react-native";

import { Color, Spacing } from "@/constants";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import Text, { TextVariant } from "@/components/Text";
import Button from "@/components/Button";

interface Props {
  onContinue: () => void;
}

export default function AwesomeScreen({ onContinue }: Props) {
  const { order } = useCurrentOrder();
  const simType = order?.simSelection?.simType; // "E_SIM" or "P_SIM"
  const isESim = simType === "E_SIM";
  const portIn = order?.portIn;
  const isPortingIn = portIn?.isPortingIn === true;
  const hasPortInFields = portIn != null && Object.keys(portIn).length > 0;
  const skippedPortIn = hasPortInFields && !isPortingIn;

  const message = useMemo(() => {
    if (isESim) {
      if (skippedPortIn) {
        return "Just follow the next steps to finish porting your number, install your eSIM, and you'll be good to go.";
      } else {
        return "Just follow the next steps to finish porting your number and install your eSIM.";
      }
    } else {
      if (skippedPortIn) {
        return "Your SIM card is on the way. Just follow the next steps to complete your number transfer and activate your SIM once it arrives.";
      } else {
        return "Your SIM card is on the way. Just activate the SIM once it arrives, insert it in your phone and you're good to go.";
      }
    }
  }, [isESim, skippedPortIn]);

  return (
    <ImageBackground style={styles.background} resizeMode="cover">
      <StatusBar
        animated
        barStyle="default"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.grayTopBlock}>
        <Text
          variant={TextVariant.H3}
          color={Color.WHITE}
          style={{ marginVertical: Spacing.SMALL }}
        >
          Awesome.
        </Text>
        <Text
          variant={TextVariant.BodyLarge}
          color={Color.WHITE}
          style={{ marginVertical: Spacing.SMALL }}
        >
          You’re almost there.{"\n"}
        </Text>
        <Text
          variant={TextVariant.BodyLarge}
          color={Color.WHITE}
          style={{ marginVertical: Spacing.SMALL }}
        >
          {message}
        </Text>
      </View>
      <View style={{ flex: 1 }} collapsable={false} />

      <Button onPress={onContinue}>Continue</Button>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingTop: Spacing.MEDIUM,
    paddingVertical: Spacing.MEDIUM,
    paddingHorizontal: Spacing.MEDIUM,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight,
  },
  text: {
    color: "#fff",
    fontSize: 24,
  },
  grayTopBlock: {
    backgroundColor: Color.DARK,
    paddingTop: Spacing.MEDIUM,
    marginTop: Spacing.LARGE,
    marginVertical: Spacing.LARGE,
    paddingHorizontal: Spacing.MEDIUM,
    paddingBottom: Spacing.SMALL,
  },
});

import { View, StyleSheet } from "react-native";
import React from "react";

import { Color, Spacing } from "@/constants";

import SafeView from "./SafeView";
import Text, { TextVariant } from "./Text";

interface LoadingProps {
  title?: string;
  processing?: boolean;
}

export default function LoadingComponent({
  title,
  processing = true,
}: LoadingProps) {
  return (
    <SafeView dark>
      <View style={styles.container}>
        {title && (
          <Text
            variant={TextVariant.H3}
            color={Color.WHITE}
            style={styles.title}
          >
            {title}
          </Text>
        )}

        <View style={styles.loaderContainer}>
          {processing && (
            <Text
              variant={TextVariant.H4}
              color={Color.WHITE}
              style={styles.title}
            >
              processing...
            </Text>
          )}
        </View>
      </View>
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Spacing.MEDIUM,
  },
  title: {
    marginVertical: Spacing.LARGE,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lottieAnimation: {
    width: 3 * Spacing.LARGE,
    height: 3 * Spacing.LARGE,
  },
});

import React from "react";
import { View, StyleSheet } from "react-native";

interface OnboardingSeparatorProps {
  color?: string; // Optional color prop
}

const OnboardingSeparator: React.FC<OnboardingSeparatorProps> = ({
  color = "#FFFFFF",
}) => {
  return <View style={[styles.separator, { backgroundColor: color }]} />;
};

const styles = StyleSheet.create({
  separator: {
    height: 1,
    width: "100%",
  },
});

export default OnboardingSeparator;

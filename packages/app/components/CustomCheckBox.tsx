import React from "react";
import {
  View,
  Text as RNText,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";

import { Color } from "@/constants";

import Text from "./Text";

interface CustomCheckboxProps {
  text: string;
  style?: StyleProp<ViewStyle>;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function CustomCheckbox({
  text,
  style,
  checked,
  onCheckedChange,
}: CustomCheckboxProps) {
  return (
    <Pressable
      onPress={() => onCheckedChange(!checked)}
      style={[styles.container, style]}
    >
      <View style={[styles.checkbox, checked && styles.checkedBox]}>
        {checked && <RNText style={styles.checkmark}>✓</RNText>}
      </View>
      <Text style={styles.label}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Color.PRIMARY,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  checkedBox: {
    backgroundColor: Color.PRIMARY,
  },
  checkmark: {
    color: Color.DARK,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    color: Color.WHITE,
    width: "90%",
  },
});

import { View, ViewStyle } from "react-native";
import { useMemo } from "react";

import { Color, Spacing } from "@/constants";

interface Props {
  value: number;
  max: number;
  containerStyle?: ViewStyle;
}

export default function ProgressBar({ value, max, containerStyle }: Props) {
  const items = useMemo(() => [...Array(max)].map((_, i) => i), [max]);

  return (
    <View
      style={[
        {
          flex: 1,
          flexDirection: "row",
          height: 4,
          gap: Spacing.SMALL,
          alignItems: "stretch",
        },
        containerStyle,
      ]}
    >
      {items.map((index) => (
        <View
          key={index}
          style={{
            flex: 1,
            opacity: index <= value ? 1 : 0.25,
            backgroundColor: Color.WHITE,
          }}
        />
      ))}
    </View>
  );
}

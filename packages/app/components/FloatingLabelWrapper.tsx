import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View, TextStyle } from "react-native";

import { Color } from "@/constants";

interface FloatingLabelWrapperProps {
  label: string;
  focused: boolean;
  hasValue: boolean;
  children: React.ReactNode;
}

const FloatingLabelWrapper: React.FC<FloatingLabelWrapperProps> = ({
  label,
  focused,
  hasValue,
  children,
}) => {
  const [animatedIsFocused] = useState(new Animated.Value(hasValue ? 1 : 0));

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: focused || hasValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused, hasValue]);

  const labelStyle: Animated.WithAnimatedObject<TextStyle> = {
    position: "absolute",
    left: 20,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 4],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    opacity: 0.5,
    color: Color.GRAY,
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingTop: 18,
    paddingBottom: 8,
  },
});

export default FloatingLabelWrapper;

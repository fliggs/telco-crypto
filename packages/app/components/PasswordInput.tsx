import { useCallback, useEffect, useRef, useState } from "react";
import { TextInput as RNTextInput } from "react-native-gesture-handler";
import { TextInputProps, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withTiming,
  WithTimingConfig,
} from "react-native-reanimated";

import { Color, Spacing } from "@/constants";

import Text, { TextVariant } from "./Text";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const CONFIG: WithTimingConfig = { duration: 200 };

export type TextInputVariant = "primary" | "secondary" | "secondary_dark";

interface Props extends TextInputProps {
  variant?: TextInputVariant;
  floatingPlaceholder?: string;
  activePlaceholder?: string;
  hideStrengthLabel?: boolean;
}

export default function PasswordInput({
  variant,
  placeholder,
  floatingPlaceholder,
  activePlaceholder,
  hideStrengthLabel,
  value,
  onChangeText,
  ...props
}: Props) {
  const bottom = useSharedValue(4);
  const textSize = useSharedValue(16);
  const ref = useRef<RNTextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const [visible, setVisible] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);

  const focus = useCallback(() => ref.current?.focus(), []);
  const toggleVisibility = () => setVisible((prev) => !prev);

  const hasValue = value && value.length > 0;
  const isValid = hasValue && value.length >= 8;
  const showError = hasBeenTouched && !isValid;

  const strengthLabel = !isValid
    ? ""
    : value.length < 12
    ? "Weak"
    : value.length < 16
    ? "Fair"
    : "Strong";

  const floatingText = isFocused
    ? activePlaceholder ?? floatingPlaceholder ?? placeholder
    : hasValue
    ? floatingPlaceholder ?? placeholder
    : placeholder;

  const handleChangeText = useCallback(
    (text: string) => {
      onChangeText?.(text);
      setHasBeenTouched(true);
    },
    [onChangeText]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setHasBeenTouched(true);
  }, []);

  useEffect(() => {
    if (isFocused || hasValue) {
      bottom.value = withTiming(36, CONFIG);
      textSize.value = withTiming(12, CONFIG);
    } else {
      bottom.value = withTiming(4, CONFIG);
      textSize.value = withTiming(16, CONFIG);
    }
  }, [isFocused, hasValue]);

  return (
    <View>
      <View style={{ position: "relative", minHeight: 56 }}>
        <RNTextInput
          textContentType="password"
          keyboardType="default"
          autoCapitalize="none"
          autoComplete="current-password"
          autoCorrect={false}
          {...props}
          ref={ref}
          value={value}
          secureTextEntry={!visible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          style={[
            props.style,
            {
              padding: Spacing.MEDIUM,
              color:
                variant === "secondary_dark"
                  ? Color.BLACK
                  : variant === "secondary"
                  ? Color.WHITE
                  : Color.BLACK,
              backgroundColor:
                variant === "secondary_dark"
                  ? Color.GRAY
                  : variant === "secondary"
                  ? Color.DARK
                  : Color.PRIMARY_DARK,
              borderWidth: showError ? 2 : 0,
              borderColor: showError ? "red" : undefined,
            },
          ]}
        />

        <AnimatedTouchable
          onPress={focus}
          activeOpacity={0.5}
          style={{
            position: "absolute",
            top: 4,
            left: Spacing.MEDIUM,
            right: 0,
            opacity: 0.5,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            bottom: bottom,
          }}
        >
          <Animated.Text
            style={{
              color: variant === "secondary" ? Color.GRAY : Color.BLACK,
              fontSize: textSize,
            }}
          >
            {floatingText}
          </Animated.Text>
        </AnimatedTouchable>

        <View
          style={{
            position: "absolute",
            right: Spacing.MEDIUM,
            top: "50%",
            transform: [{ translateY: -10 }],
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          {!hideStrengthLabel && strengthLabel && (
            <Text
              style={{
                color:
                  variant === "secondary"
                    ? Color.DARK_GRAY
                    : variant === "secondary_dark"
                    ? Color.BLACK
                    : Color.DARK,
                textTransform: "lowercase",
              }}
              variant={TextVariant.Fineprint}
            >
              {strengthLabel}
            </Text>
          )}
          <TouchableOpacity onPress={toggleVisibility}>
            <Feather
              name={visible ? "eye" : "eye-off"}
              size={20}
              color={variant === "secondary" ? Color.WHITE : Color.BLACK}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showError && (
        <View style={{ minHeight: 20, marginTop: 4 }}>
          <Text
            variant={TextVariant.Fineprint}
            style={{ color: "red", marginLeft: Spacing.MEDIUM }}
          >
            Please enter a valid password
          </Text>
        </View>
      )}
    </View>
  );
}

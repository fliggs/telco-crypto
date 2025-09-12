import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextInput as RNTextInput } from "react-native-gesture-handler";
import {
  StyleProp,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
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
  containerStyle?: StyleProp<ViewStyle>;
  isRequired?: boolean;
  onlyNumbers?: boolean;
  setisValid?: (isValid: boolean) => void;
  triggerValidation?: boolean;
  floatingPlaceholder?: string;
  activeFloatingPlaceholder?: string;
  readOnly?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const TextInput: FC<Props> = ({
  variant,
  containerStyle,
  placeholder,
  triggerValidation,
  value,
  isRequired = false,
  keyboardType,
  setisValid,
  onlyNumbers,
  floatingPlaceholder,
  activeFloatingPlaceholder,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const bottom = useSharedValue(4);
  const textSize = useSharedValue(16);
  const hasValue = useMemo(() => (value?.length ?? 0) > 0, [value]);
  const ref = useRef<RNTextInput | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [debouncedEmailValid, setDebouncedEmailValid] = useState(true);

  const isEmailInput = keyboardType === "email-address";

  const floatingText =
    isFocused || hasValue
      ? activeFloatingPlaceholder ?? floatingPlaceholder ?? placeholder
      : floatingPlaceholder || placeholder;

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showEmailError, setShowEmailError] = useState(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const showError =
    (isRequired && !hasValue && hasBeenTouched) ||
    (isEmailInput && showEmailError);

  useEffect(() => {
    if (!hasBeenTouched) return;

    const valueToCheck = value ?? "";

    const validate = () => {
      if (keyboardType === "email-address") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValidEmail = emailRegex.test(valueToCheck);
        setDebouncedEmailValid(isValidEmail);
        setisValid?.(isValidEmail);
      } else if (isRequired) {
        const isValid = valueToCheck.trim().length > 0;
        setisValid?.(isValid);
      } else {
        setisValid?.(true);
      }
    };

    if (triggerValidation) {
      validate();
      return;
    }

    const handler = setTimeout(validate, 400);

    return () => clearTimeout(handler);
  }, [value, keyboardType, isRequired, triggerValidation]);

  const handleChangeText = useCallback(
    (text: string) => {
      const valueToUse = onlyNumbers ? text.replace(/[^0-9]/g, "") : text;
      props.onChangeText?.(valueToUse);

      if (!hasBeenTouched) setHasBeenTouched(true);
      if (keyboardType === "email-address") {
        setShowEmailError(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    },
    [onlyNumbers, props.onChangeText, hasBeenTouched, keyboardType]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setHasBeenTouched(true);

    if (keyboardType === "email-address" && !debouncedEmailValid) {
      setShowEmailError(true);
    }
  }, [keyboardType, debouncedEmailValid]);

  useEffect(() => {
    if (isFocused || hasValue) {
      bottom.value = withTiming(36, CONFIG);
      textSize.value = withTiming(12, CONFIG);
    } else {
      bottom.value = withTiming(4, CONFIG);
      textSize.value = withTiming(16, CONFIG);
    }
  }, [isFocused, hasValue]);

  const focus = useCallback(() => ref.current?.focus(), []);
  const textColor =
    props.readOnly
      ? Color.GRAY
      : variant === "secondary_dark"
        ? Color.BLACK
        : variant === "secondary"
          ? Color.WHITE
          : Color.BLACK;

  const backgroundColor =
    variant === "secondary_dark"
      ? Color.GRAY
      : variant === "secondary"
        ? Color.DARK
        : Color.PRIMARY_DARK;

  return (
    <View style={[containerStyle]}>
      <View style={{ position: "relative", minHeight: 56 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <RNTextInput
            {...props}
            ref={ref}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!props.readOnly}
            style={[
              props.style,
              {
                flex: 1,
                padding: Spacing.MEDIUM,
                color: textColor,
                backgroundColor,
                borderWidth: showError ? 2 : 0,
                borderColor: showError ? "red" : undefined,
              },
            ]}
            onChangeText={(t) => handleChangeText(t)}
            keyboardType={onlyNumbers ? "phone-pad" : keyboardType}
          />
          {rightIcon && (
            <View style={{ backgroundColor }}>
              <TouchableOpacity
                onPress={onRightIconPress}
                style={{
                  height: 59,
                  aspectRatio: 1,
                  backgroundColor,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {rightIcon}
              </TouchableOpacity>
            </View>

          )}
        </View>

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
      </View>

      {showEmailError && isEmailInput && !debouncedEmailValid && (
        <View style={{ minHeight: 20, marginTop: 4 }}>
          <Text
            variant={TextVariant.Fineprint}
            style={{ color: "red", marginLeft: Spacing.MEDIUM }}
          >
            Please enter a valid email address
          </Text>
        </View>
      )}
    </View>
  );
};

export default TextInput;

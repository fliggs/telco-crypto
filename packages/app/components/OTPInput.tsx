import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { View, StyleSheet } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { Dimensions } from "react-native";

import { Color, Spacing } from "@/constants";

interface OTPInputProps {
  onComplete?: (code: string) => void;
  length?: number;
  variant?: "primary" | "secondary" | "secondary_dark";
}

export interface OTPInputHandle {
  setValue: (val: string) => void;
  clear: () => void;
  focus: () => void;
}

const OTPInput = forwardRef<OTPInputHandle, OTPInputProps>(
  ({ onComplete, length = 6 }, ref) => {
    const otpRef = useRef<OtpInputRef>(null);

    useImperativeHandle(ref, () => ({
      setValue: (val: string) => {
        otpRef.current?.setValue(val);
      },
      clear: () => {
        otpRef.current?.clear();
      },
      focus: () => {
        otpRef.current?.focus();
      },
    }));
    const { width: screenWidth } = Dimensions.get("window");
    const totalHorizontalPadding = 40;
    const numberOfDigits = length ?? 6;
    const gapBetweenBoxes = 4;
    const totalGapWidth = (numberOfDigits - 1) * gapBetweenBoxes;

    const availableWidth = screenWidth - totalHorizontalPadding - totalGapWidth;
    const inputWidth = availableWidth / numberOfDigits;
    return (
      <View style={styles.container}>
        <OtpInput
          ref={otpRef}
          numberOfDigits={numberOfDigits}
          focusColor="green"
          autoFocus={false}
          hideStick={true}
          blurOnFilled={true}
          disabled={false}
          type="numeric"
          secureTextEntry={false}
          focusStickBlinkingDuration={500}
          onFilled={(text) => onComplete?.(text)}
          textInputProps={{
            accessibilityLabel: "One-Time Password",
          }}
          textProps={{
            accessibilityRole: "text",
            accessibilityLabel: "OTP digit",
            allowFontScaling: false,
          }}
          theme={{
            containerStyle: {
              flexDirection: "row",
              gap: 4,
            },
            pinCodeContainerStyle: {
              backgroundColor: Color.DARK,
              width: inputWidth,
              height: inputWidth,
              borderRadius: 0,
              borderWidth: 1,
              borderColor: Color.BLACK, // 🔲 Set black border by default
            },
            focusedPinCodeContainerStyle: {
              borderWidth: 2,
              borderColor: Color.BLACK, // 🔲 Border color on focus
            },
            filledPinCodeContainerStyle: {
              borderWidth: 1,
              borderColor: Color.BLACK, // 🔲 Maintain border when filled (optional)
            },
            disabledPinCodeContainerStyle: {
              borderWidth: 1,
              borderColor: Color.GRAY, // optional fallback for disabled input
            },
            pinCodeTextStyle: {
              color: Color.WHITE,
              fontSize: 20,
            },
            focusStickStyle: {
              height: 2,
              backgroundColor: Color.PRIMARY,
            },
          }}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: Spacing.SMALL,
  },
});

export default OTPInput;

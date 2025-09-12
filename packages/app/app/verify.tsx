import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Linking, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { t } from "i18next";

import { useLocalAuth } from "@/providers/LocalAuthProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { Color, Spacing } from "@/constants";
import Button, { ButtonType } from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";
import OTPInput, { OTPInputHandle } from "@/components/OTPInput";

export const loginActions = {
  ChangePw: "reset",
  SignUp: "sign-up",
};

export default function Verify() {
  const { showError } = useErrorSheet();
  const { strategies, verify, resendVerify, reset } = useLocalAuth();
  const otpRef = useRef<OTPInputHandle>(null);
  const { email, action } = useLocalSearchParams<{
    email: string;
    action: string;
  }>();

  const handleSetOTP = () => otpRef.current?.setValue("");

  const onPress = useCallback(
    async (code: string) => {
      const strategy = strategies[0];

      try {
        if (action === loginActions.ChangePw) {
          router.push({
            pathname: "/newPass",
            params: { email, code },
          });
        } else if (action === loginActions.SignUp) {
          await verify(strategy.name, email, code);
          router.replace(`/sign-in`);
        }
      } catch (err) {
        showError({
          error: err,
          onClose: () => {
            handleSetOTP();
          },
        });
      }
    },
    [strategies, email]
  );

  const onResend = useCallback(async () => {
    const strategy = strategies[0];

    try {
      if (action === loginActions.SignUp) {
        await resendVerify(strategy.name, email);
      } else if (action === loginActions.ChangePw) {
        await reset(strategy.name, email);
      }
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [strategies, email, action]);

  return (
    <SafeView dark>
      <Header showBack chevronColor={Color.WHITE} />

      <Text
        variant={TextVariant.H3}
        color={Color.WHITE}
        style={{ flexWrap: "wrap" }}
      >
        {action == loginActions.ChangePw
          ? "Reset\npassword."
          : "Create Account."}
      </Text>

      <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
        {t("verify.sent-email")} '{email}'.
      </Text>

      <Button
        type={ButtonType.PRIMARY}
        onPress={() => {
          Linking.openURL("mailto:");
        }}
      >
        {t("verify.mailbox")}
      </Button>
      <View style={{ marginVertical: Spacing.SMALL }}>
        <Text
          variant={TextVariant.BodyLarge}
          color={Color.WHITE}
          style={{ marginTop: Spacing.SMALL }}
        >
          {t("verify.enter-verification")}
        </Text>

        <OTPInput onComplete={onPress} ref={otpRef} />
      </View>

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          columnGap: Spacing.LARGE,
        }}
      >
        <Text
          color={Color.WHITE}
          variant={TextVariant.Fineprint}
          style={{ flex: 1 }}
        >
          {t("verify.didnt-receive")}
        </Text>

        <RectButton onPress={onResend}>
          <Text variant={TextVariant.Description}>
            {t("verify.resend")} {">"}
          </Text>
        </RectButton>
      </View>
    </SafeView>
  );
}

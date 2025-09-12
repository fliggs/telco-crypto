import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useLocalAuth } from "@/providers/LocalAuthProvider";
import { Color } from "@/constants";
import Button, { ButtonType } from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";
import TextInput from "@/components/TextInput";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

import { loginActions } from "./verify";

export default function Reset() {
  const { authApi } = useApi();
  const { showError } = useErrorSheet();
  const { strategies } = useLocalAuth();
  const [email, setEmail] = useState("");

  const handleReset = useCallback(async () => {
    try {
      const strategy = strategies[0]?.name;
      await authApi.localResetPasswordV1({
        strategy,
        resetPasswordDto: { email },
      });
      router.push({
        pathname: "/verify",
        params: { email, action: loginActions.ChangePw },
      });
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [authApi, strategies, email]);

  return (
    <SafeView dark>
      <Header showBack chevronColor={Color.WHITE} />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        {"Reset\npassword."}
      </Text>

      <>
        <Text color={Color.WHITE}>Please enter your email</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          variant="secondary"
        />
      </>

      <View style={{ flexGrow: 1 }} />

      <Link href="/sign-in" replace>
        <Text variant={TextVariant.Link} color={Color.BLACK}>
          I already have an account. {">"}
        </Text>
      </Link>

      <Button
        type={ButtonType.PRIMARY}
        enabled={!!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
        onPress={handleReset}
      >
        {"Confirm"}
      </Button>
    </SafeView>
  );
}

import { Link, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { t } from "i18next";

import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useLocalAuth } from "@/providers/LocalAuthProvider";
import { Color, Spacing } from "@/constants";
import Button, { ButtonType } from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";
import BottomSheet from "@/components/BottomSheet";
import { PublicSessionTokensDto } from "api-client-ts";

export default function newPass() {
  const { authApi, setSession } = useApi();
  const { showError } = useErrorSheet();
  const { strategies } = useLocalAuth();
  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();
  const [password, setPassword] = useState("");
  const [tokens, setTokens] = useState<PublicSessionTokensDto>();

  const handleSetPassword = useCallback(
    async (email: string, code: string) => {
      try {
        const strategy = strategies[0]?.name;
        const tokens = await authApi.localSetPasswordV1({
          strategy,
          setPasswordDto: { email, code, password },
        });
        setTokens(tokens);
      } catch (err) {
        showError({ error: err });
        throw err;
      }
    },
    [authApi, strategies, password]
  );

  const handleLogin = useCallback(async () => {
    try {
      if (!tokens) {
        throw new Error("missing_tokens");
      }

      const strategy = strategies[0]?.name;
      setSession({ provider: "local", strategy }, tokens);
      router.replace(`/logged-in/main`);
    } catch (err) {
      showError({ error: err });
    }
  }, [authApi, strategies, tokens]);

  return (
    <SafeView dark>
      <Header showBack chevronColor={Color.WHITE} />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        {"Reset\npassword."}
      </Text>

      <>
        <Text color={Color.WHITE}>Please enter a new password</Text>

        <PasswordInput
          value={password}
          onChangeText={setPassword}
          variant="secondary"
          placeholder={t("login.password")}
          activePlaceholder={t("login.password-condition")}
          autoComplete="new-password"
        />
      </>

      <View style={{ flexGrow: 1 }} />

      <Link href="/sign-in" replace>
        <Text variant={TextVariant.Link} color={Color.BLACK}>
          I already have an account. {">"}
        </Text>
      </Link>

      <BottomSheet
        trigger={(show) => (
          <Button
            type={ButtonType.PRIMARY}
            enabled={password.length > 0}
            onPress={() => handleSetPassword(email, code).then(show)}
          >
            {"Confirm"}
          </Button>
        )}
        onClose={handleLogin}
        imageSuccess={true}
      >
        {(close) => (
          <>
            <Text
              variant={TextVariant.H4}
              color={Color.BLACK}
              style={{ marginBottom: Spacing.SMALL }}
            >
              Your password has been changed.
            </Text>
            <Button
              style={{
                marginTop: Spacing.SMALL,
                width: "95%",
                marginBottom: Spacing.SMALL,
              }}
              onPress={close}
            >
              OK
            </Button>
          </>
        )}
      </BottomSheet>
    </SafeView>
  );
}

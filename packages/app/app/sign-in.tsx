import { Redirect, router } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { AuthProvider, PublicAuthStrategyDto } from "api-client-ts";
import { add, isBefore } from "date-fns";
import { t } from "i18next";

import { extractErrorMsg, logError } from "@/util";
import { useLocalAuth } from "@/providers/LocalAuthProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useSocialAuth } from "@/providers/SocialAuthProvider";
import { useMe } from "@/providers/MeProvider";
import { Color, Spacing } from "@/constants";
import Button, { ButtonType } from "@/components/Button";
import TextInput from "@/components/TextInput";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useApi } from "@/providers/ApiProvider";
import PasswordInput from "@/components/PasswordInput";

import { loginActions } from "./verify";

export default function SignIn() {
  const { me } = useMe(false);
  const { strategies, signIn } = useLocalAuth();
  const { validStrategies, login } = useSocialAuth();
  const { setSession, authApi } = useApi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showError } = useErrorSheet();

  const socialStrategies = validStrategies.filter(
    (s) => s.provider !== AuthProvider.Local
  );

  const handleLocalSignIn = useCallback(async () => {
    const strategy = strategies[0];

    try {
      await signIn(strategy.name, email, password);
    } catch (err) {
      const msg = await extractErrorMsg(err);
      if (msg === "user_not_verified") {
        router.push({
          pathname: "/verify",
          params: { email, action: loginActions.SignUp },
        });
      } else if (msg === "user_not_found") {
        router.push({
          pathname: "/sign-up",
          params: { password, email },
        });
      } else {
        showError({ error: msg });
      }
    }
  }, [strategies, signIn, email, password]);

  const handleResetPassword = useCallback(async () => {
    if (email.length > 0) {
      const strategy = strategies[0]?.name;
      await authApi.localResetPasswordV1({
        strategy,
        resetPasswordDto: { email },
      });
      router.push({
        pathname: "/verify",
        params: { email, action: loginActions.ChangePw },
      });
    } else {
      router.push("/reset");
    }
  }, [authApi, strategies, email, password]);

  const handleSocial = useCallback(
    async (strategy: PublicAuthStrategyDto) => {
      try {
        const jwt = await login(strategy);
        setSession(
          { provider: strategy.provider, strategy: strategy.name },
          jwt
        );
      } catch (error: any) {
        logError(error);

        if (
          error.code === "1001" ||
          error.message === "E_SIGNIN_CANCELLED_ERROR" ||
          error.message?.includes("Cancelled by user.") ||
          error.message?.includes("The user canceled the sign-in flow")
        ) {
          // These are all errors that resulted from the user cancelling the login, so don't show an error message on our side
        } else {
          console.error(
            "Login error:",
            error,
            JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))
          );
          showError({ error: "Sign-in failed" });
        }
      }
    },
    [showError]
  );

  if (me) {
    const isNewSocialUser =
      me.provider !== AuthProvider.Local &&
      isBefore(new Date(), add(me.createdAt, { minutes: 10 }));

    if (!me.firstName || !me.lastName || isNewSocialUser) {
      return <Redirect href="/sign-up?mode=complete" />;
    } else {
      return <Redirect href="/logged-in/main" />;
    }
  }

  return (
    <SafeView dark>
      <Text
        variant={TextVariant.H3}
        color={Color.WHITE}
        style={{ marginTop: Spacing.MEDIUM }}
      >
        {t("login.welcome")}
      </Text>

      <View style={{ gap: Spacing.SMALL, marginBottom: Spacing.MEDIUM }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("login.email")}
          textContentType="emailAddress"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          variant="secondary"
          isRequired
        />

        <PasswordInput
          value={password}
          onChangeText={setPassword}
          variant="secondary"
          placeholder={t("login.password")}
          activePlaceholder={t("login.password-condition")}
        />

        <RectButton
          onPress={handleResetPassword}
          style={{ alignSelf: "flex-end" }}
        >
          <Text variant={TextVariant.Link} style={{ marginTop: Spacing.SMALL }}>
            {t("login.reset-password")}
            {" >"}
          </Text>
        </RectButton>
      </View>
      <Button
        type={ButtonType.PRIMARY}
        onPress={handleLocalSignIn}
        enabled={!!email && !!password}
        style={{ marginTop: Spacing.MEDIUM }}
      >
        {t("global.button-continue")}
      </Button>
      <View style={{ flex: 1 }} collapsable={false} />
      <View style={styles.container}>
        <View style={styles.line} />
        <Text
          style={styles.text}
          variant={TextVariant.BodyLarge}
          color={Color.WHITE}
        >
          Or continue with
        </Text>
        <View style={styles.line} />
      </View>
      {socialStrategies.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            gap: Spacing.SMALL,
            justifyContent: "space-around",
            paddingHorizontal: Spacing.LARGE,
          }}
        >
          {socialStrategies.map((strategy) => (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              key={`${strategy.provider}-${strategy.name}`}
            >
              <TouchableOpacity
                key={strategy.name}
                onPress={() => handleSocial(strategy)}
                style={{
                  backgroundColor: Color.DARK,
                  borderRadius: 50,
                  width: 90,
                  height: 90,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {strategy.provider === AuthProvider.Google ? (
                  <AntDesign name="google" size={45} color="white" />
                ) : strategy.provider === AuthProvider.Apple ? (
                  <AntDesign name="apple1" size={45} color="white" />
                ) : (
                  <AntDesign name="login" size={45} color="white" />
                )}
              </TouchableOpacity>
              <Text
                variant={TextVariant.BodyLarge}
                style={{ marginTop: Spacing.SMALL }}
                color={Color.WHITE}
              >
                {strategy.title}
              </Text>
            </View>
          ))}
        </View>
      )}
    </SafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  text: {
    marginHorizontal: 8,
    // color: "white",
    // fontSize: 14,
  },
});

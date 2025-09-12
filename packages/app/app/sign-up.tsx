import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";

import { useLocalAuth } from "@/providers/LocalAuthProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useApi } from "@/providers/ApiProvider";
import { useMe } from "@/providers/MeProvider";
import Button, { ButtonType } from "@/components/Button";
import TextInput from "@/components/TextInput";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import BottomSheet from "@/components/BottomSheet";
import { useTranslation } from "@/node_modules/react-i18next";
import { get, set } from "@/storage";

import { loginActions } from "./verify";

export default function SignUp() {
  const { signOut } = useMe(false);
  const { settingsApi } = useApi();
  const { strategies, signUp } = useLocalAuth();
  const { showError } = useErrorSheet();
  const { me, update } = useMe(false);
  const [firstName, setFirstName] = useState(me?.firstName ?? "");
  const [lastName, setLastName] = useState(me?.lastName ?? "");
  const { t } = useTranslation();
  const enabled = !!firstName && !!lastName;
  const { email, password, mode } = useLocalSearchParams<{
    email: string;
    password: string;
    mode?: string;
  }>();

  const [terms, setTerms] = useState<string[]>([]);
  const [privacyTerms, setPrivacyTerms] = useState<string[]>([]);
  const { meApi } = useApi();

  const fetchTerms = async () => {
    try {
      const cached = get<{ timestamp: number; data: any }>("cached_terms");

      if (cached && Date.now() - cached.timestamp < 86400000) {
        setTerms(cached.data);
      } else {
        const data = await settingsApi.settingsGetTermsAndConditionsV1();
        setTerms(data);
        set("cached_terms", { timestamp: Date.now(), data });
      }
    } catch (e) {
      console.error("Failed to fetch terms:", e);
    }
  };

  const fetchPrivacyTerms = async () => {
    try {
      const cached = get<{ timestamp: number; data: any }>(
        "cached_privacy_terms"
      );

      if (cached && Date.now() - cached.timestamp < 86400000) {
        setPrivacyTerms(cached.data);
      } else {
        const data = await settingsApi.settingsGetPrivacyPolicyV1();
        setPrivacyTerms(data);
        set("cached_privacy_terms", { timestamp: Date.now(), data });
      }
    } catch (e) {
      console.error("Failed to fetch privacy terms:", e);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      await update({ firstName, lastName });
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, firstName, lastName]);

  const onPress = useCallback(async () => {
    if (mode == "complete") {
      //ADD save user firstname and lastname
      handleSave();
      if (me?.provider === "local") {
        router.push("/verify");
      } else {
        router.replace("/logged-in/main");
      }
    } else {
      try {
        const strategy = strategies[0]?.name;
        await signUp(strategy, email, password, firstName, lastName);
        router.push({
          pathname: "/verify",
          params: { email, action: loginActions.SignUp },
        });
      } catch (err) {
        showError({
          error: err,
        });
      }
    }
  }, [strategies, firstName, lastName, email, password]);

  const onBack = useCallback(async () => {
    await signOut();
    router.replace("/");
  }, []);

  return (
    <SafeView dark>
      <Header showBack chevronColor={Color.WHITE} onBackPress={onBack} />

      <Text
        variant={TextVariant.H3}
        color={Color.WHITE}
        style={{ flexWrap: "wrap" }}
      >
        {t("signup.title")}
      </Text>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: Spacing.SMALL }}>
          <Text
            variant={TextVariant.BodyLarge}
            color={Color.WHITE}
            style={{ marginVertical: Spacing.SMALL }}
          >
            {t("signup.sub-title")}
          </Text>

          <TextInput
            textContentType="givenName"
            autoComplete="given-name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t("signup.first-name")}
            autoCorrect={false}
            variant="secondary"
          />

          <TextInput
            textContentType="familyName"
            autoComplete="family-name"
            value={lastName}
            onChangeText={setLastName}
            placeholder={t("signup.last-name")}
            autoCorrect={false}
            variant="secondary"
          />
        </View>

        <View style={{ flex: 1 }} collapsable={false} />

        <Text
          variant={TextVariant.BodySmall}
          color={Color.WHITE}
          style={{ marginVertical: Spacing.SMALL }}
        >
          {t("signup.by-continuing-you-accept-the")}{" "}
          <BottomSheet
            trigger={(show) => (
              <Text
                variant={TextVariant.Link}
                style={{ fontWeight: "bold" }}
                onPress={() => {
                  show();
                  fetchTerms();
                }}
              >
                terms of use {"> "}
              </Text>
            )}
          >
            <Text
              variant={TextVariant.H3}
              color={Color.BLACK}
              style={{
                flexWrap: "wrap",
                flexShrink: 1,
              }}
            >
              {t("global.terms-and-conditions")}
            </Text>
            {terms.map((term, i) => (
              <Text key={i} color={Color.BLACK}>
                {term}
              </Text>
            ))}
          </BottomSheet>
          {t("signup.and-the")}{" "}
          <BottomSheet
            trigger={(show) => (
              <Text
                variant={TextVariant.Link}
                style={{ fontWeight: "bold" }}
                onPress={() => {
                  show();
                  fetchPrivacyTerms();
                }}
              >
                {t("global.privacy-policy")} {"> "}
              </Text>
            )}
          >
            <Text
              variant={TextVariant.H3}
              color={Color.BLACK}
              style={{ textTransform: "capitalize" }}
            >
              {t("global.privacy-policy")}
            </Text>

            {privacyTerms.map((term, i) => (
              <Text key={i} color={Color.BLACK}>
                {term}
              </Text>
            ))}
          </BottomSheet>
          {t("signup.mobile-inc")}
        </Text>

        <Link href="/sign-in" style={{ marginVertical: Spacing.MEDIUM }}>
          <Text variant={TextVariant.Link}>
            {t("signup.already-have-account")} {">"}
          </Text>
        </Link>

        <Button type={ButtonType.PRIMARY} onPress={onPress} enabled={enabled}>
          {"Confirm"}
        </Button>
      </ScrollView>
    </SafeView>
  );
}

import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { RectButton, ScrollView } from "react-native-gesture-handler";
import { View } from "react-native";

import { Color, Spacing } from "@/constants";
import Button, { ButtonType } from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";
import TextInput from "@/components/TextInput";
import BottomSheet from "@/components/BottomSheet";
import { useTranslation } from "@/node_modules/react-i18next";

interface Props {
  onContinue: (
    doLater: boolean,
    postalCode: string,
    accountId: string,
    password: string
  ) => void;
}

export default function MsisdnSelectionStep3({ onContinue }: Props) {
  const { t } = useTranslation();
  const { num } = useLocalSearchParams<{ num: string }>();
  const [ospAccountId, setOspAccountId] = useState("");
  const [ospPostalCode, setOspPostalCode] = useState("");
  const [ospPassword, setOspPassword] = useState("");

  const onPress = useCallback(
    (doLater: boolean) => {
      onContinue(doLater, ospAccountId, ospPostalCode, ospPassword);
    },
    [onContinue, ospAccountId, ospPostalCode, ospPassword]
  );

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        variant={TextVariant.H3}
        color={Color.WHITE}
        style={{
          flexWrap: "wrap",
          flexShrink: 1,
          marginBottom: Spacing.SMALL,
        }}
      >
        {t("onboarding.request")} {"\n"}
        {t("onboarding.transfer")}.{" "}
      </Text>

      <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
        {"Your number:\n"}
        <Text variant={TextVariant.Description} color={Color.WHITE}>
          {num}
        </Text>
      </Text>

      <Text
        variant={TextVariant.BodySmall}
        color={Color.WHITE}
        style={{ marginVertical: Spacing.MEDIUM }}
      >
        {t("onboarding.enter-account-information")}
      </Text>

      <View
        style={{
          display: "flex",
          flexDirection: "column",
          gap: Spacing.SMALL,
        }}
      >
        <TextInput
          value={ospPostalCode}
          onChangeText={setOspPostalCode}
          placeholder={t("onboarding.billing-zip-code")}
          variant="secondary"
          onlyNumbers
        />
        <TextInput
          value={ospAccountId}
          onChangeText={setOspAccountId}
          placeholder={t("onboarding.account-number-or-ID")}
          variant="secondary"
          onlyNumbers
        />
        <TextInput
          value={ospPassword}
          onChangeText={setOspPassword}
          placeholder={t("onboarding.transfer-pin")}
          variant="secondary"
          onlyNumbers
        />

        <BottomSheet
          trigger={(show) => (
            <RectButton onPress={show} style={{ marginBottom: Spacing.LARGE }}>
              <Text variant={TextVariant.Description} color={Color.PRIMARY}>
                {t("onboarding.How-get-data")} {">"}
              </Text>
            </RectButton>
          )}
        >
          {(close) => (
            <>
              <Text
                variant={TextVariant.H4}
                color={Color.BLACK}
                style={{
                  flexWrap: "wrap",
                  flexShrink: 1,
                  marginBottom: Spacing.SMALL,
                }}
              >
                {t("onboarding.How-get-data")}
              </Text>

              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {t("onboarding.lorem")}
              </Text>

              <Button
                style={{
                  alignSelf: "stretch",
                  marginTop: Spacing.SMALL,
                }}
                onPress={close}
              >
                {t("global.button-ok")}
              </Button>
            </>
          )}
        </BottomSheet>
      </View>

      <View style={{ flex: 1 }} collapsable={false} />

      <View style={{ gap: Spacing.SMALL }}>
        <Button
          type={ButtonType.TRANSPARENT_BORD}
          onPress={() => onPress(true)}
        >
          {t("onboarding.do-later")}
        </Button>

        <BottomSheet
          trigger={(show) => (
            <Button
              onPress={show}
              enabled={!!ospPostalCode && !!ospAccountId && !!ospPassword}
            >
              {t("global.button-continue")}
            </Button>
          )}
          imageSuccess={true}
        >
          {(close) => (
            <View
              style={{
                paddingHorizontal: Spacing.SMALL,
                gap: Spacing.SMALL,
                paddingVertical: Spacing.SMALL,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Text
                variant={TextVariant.H4}
                color={Color.BLACK}
                style={{
                  flexWrap: "wrap",
                  flexShrink: 1,
                  marginBottom: Spacing.SMALL,
                }}
              >
                {t("onboarding.request-received")}
              </Text>
              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {t("onboarding.request-received-msg")}
              </Text>
              <View style={{}}>
                <Button
                  style={{
                    marginTop: Spacing.SMALL,
                    width: "100%",
                    alignSelf: "stretch",
                  }}
                  onPress={() => {
                    onPress(false);
                    close();
                  }}
                >
                  {t("global.button-ok")}
                </Button>
              </View>
            </View>
          )}
        </BottomSheet>
      </View>
    </ScrollView>
  );
}

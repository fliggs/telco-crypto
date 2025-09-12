import { useCallback, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { View } from "react-native";

import { Color, Spacing } from "@/constants";
import { logError } from "@/util";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import Button from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";
import TextInput from "@/components/TextInput";
import { useTranslation } from "@/node_modules/react-i18next";

interface Props {
  onContinue: (num: string) => void;
}

export default function MsisdnSelectionStep2({ onContinue }: Props) {
  const { t } = useTranslation();
  const { telcoApi } = useApi();
  const { showError } = useErrorSheet();
  const [existingNumber, setExistingNumber] = useState("");

  const onPress = useCallback(async () => {
    try {
      const res = await telcoApi
        .telcoCheckPortInV1({ checkPortInDto: { msisdn: existingNumber } })
        .catch((err) => {
          logError(err);
          return null;
        });

      if (!res?.isEligible) {
        showError({
          title: `${t("onboarding.we-are-sorry")}`,
          onClose: () => {
            setExistingNumber("");
          },
          error: `${t("onboarding.we-are-sorry-msg")}`,
        });
        return;
      }

      onContinue(existingNumber);
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [telcoApi, showError, onContinue, existingNumber]);

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
      <Text
        variant={TextVariant.BodyLarge}
        color={Color.WHITE}
        style={{
          marginTop: Spacing.SMALL,
          marginBottom: Spacing.MEDIUM,
        }}
      >
        {t("onboarding.enter-number-wish-transfer")}
      </Text>
      <TextInput
        value={existingNumber}
        placeholder={t("onboarding.your-current-number")}
        onChangeText={setExistingNumber}
        variant="secondary"
        containerStyle={{ marginBottom: 0 }}
        isRequired
        onlyNumbers
      />

      <View style={{ flex: 1 }} collapsable={false} />

      <View style={{ gap: Spacing.SMALL }}>
        <Button onPress={onPress} enabled={!!existingNumber}>
          {t("global.button-continue")}
        </Button>
      </View>
    </ScrollView>
  );
}

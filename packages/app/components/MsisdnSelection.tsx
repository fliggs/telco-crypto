import { useCallback, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { View } from "react-native";

import { Color, Spacing } from "@/constants";
import Button from "@/components/Button";
import SelectableCard, { CardVariant } from "@/components/SelectableCard";
import Text, { TextVariant } from "@/components/Text";
import { useTranslation } from "@/node_modules/react-i18next";

interface Props {
  onContinue: (option: "new" | "bring") => void;
}

export default function MsisdnSelection({ onContinue }: Props) {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<"new" | "bring" | "">(
    ""
  );

  const onPress = useCallback(async () => {
    if (!selectedOption) {
      return;
    }

    onContinue(selectedOption);
  }, [onContinue, selectedOption]);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        variant={TextVariant.H3}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("onboarding.choose-your-number")}
      </Text>
      <View style={{ gap: Spacing.SMALL }}>
        <SelectableCard
          title={t("onboarding.get-number")}
          description={t("onboarding.get-number-msg")}
          variant={CardVariant.SECONDARY}
          selected={selectedOption === "new"}
          onPress={() => setSelectedOption("new")}
        />
        <SelectableCard
          title={t("onboarding.bring-your-number")}
          description={t("onboarding.bring-your-number-msg")}
          variant={CardVariant.SECONDARY}
          selected={selectedOption === "bring"}
          onPress={() => setSelectedOption("bring")}
        />
      </View>

      <View style={{ flex: 1 }} collapsable={false} />

      <View style={{ gap: Spacing.SMALL }}>
        <Button onPress={onPress} enabled={selectedOption !== ""}>
          {t("global.button-continue")}
        </Button>
      </View>
    </ScrollView>
  );
}

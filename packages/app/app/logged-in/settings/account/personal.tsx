import { View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import { Color, Spacing } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsAccountPersonal() {
  const { t } = useTranslation();
  const { me, update } = useMe();
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    setFirstName(me.firstName);
    setLastName(me.lastName);
  }, [me]);

  const handleSave = useCallback(async () => {
    try {
      await update({ firstName, lastName });
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, firstName, lastName]);

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />

      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
      >
        {t("account.personal-details-title")}
      </Text>

      <TextInput
        placeholder="First Name"
        variant="secondary"
        autoCorrect={false}
        autoComplete="given-name"
        value={firstName}
        onChangeText={setFirstName}
      />

      <TextInput
        placeholder="Last Name"
        variant="secondary"
        autoCorrect={false}
        autoComplete="family-name"
        value={lastName}
        onChangeText={setLastName}
      />

      <TextInput
        placeholder="Email Address"
        variant="secondary"
        value={me.email}
        readOnly
      />

      <View style={{ flex: 1 }} />

      <Button onPress={handleSave}>{t("global.button-save")}</Button>
    </SafeView>
  );
}

import React, { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "@/node_modules/react-i18next";

import SafeView from "@/components/SafeView";
import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import Text, { TextVariant } from "@/components/Text";
import SelectableCard, { CardVariant } from "@/components/SelectableCard";
import Button from "@/components/Button";
import BottomSheet from "@/components/BottomSheet";
import { useMe } from "@/providers/MeProvider";

const email = () => {
  const { t } = useTranslation();
  const { me, update } = useMe();
  const [isEmailEnabled, setIsEmailEnabled] = useState<boolean>(
    me.settings.email ?? true
  );
  const hasChanged = isEmailEnabled !== me.settings.email;

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />
      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("account.email-settings-title")}
      </Text>
      <Text variant={TextVariant.BodyMedium} color={Color.WHITE}>
        {t("account.email-settings-description")}
      </Text>
      <Text variant={TextVariant.BodyMedium} color={Color.WHITE}>
        {t("account.email-settings-description2")}
      </Text>

      <View style={{ gap: Spacing.SMALL, marginVertical: Spacing.SMALL }}>
        <SelectableCard
          title="On"
          variant={CardVariant.SECONDARY}
          selected={isEmailEnabled === true}
          onPress={() => setIsEmailEnabled((prev) => !prev)}
        />
        <SelectableCard
          title="Off"
          variant={CardVariant.SECONDARY}
          selected={isEmailEnabled === false}
          onPress={() => setIsEmailEnabled((prev) => !prev)}
        />
      </View>
      <View style={{ flex: 1 }} collapsable={false} />

      <BottomSheet
        trigger={(show) => (
          <Button
            enabled={hasChanged}
            onPress={() => {
              update({ settings: { email: isEmailEnabled } }).then(show);
            }}
          >
            {t("global.button-confirm")}
          </Button>
        )}
        imageSuccess={true}
      >
        {(close) => (
          <View
            style={{
              gap: Spacing.SMALL,
              paddingVertical: Spacing.SMALL,
              display: "flex",
              justifyContent: "center",
              width: "95%",
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
              {t("account.email-settings-changed")}
            </Text>

            <View style={{}}>
              <Button
                style={{
                  marginTop: Spacing.SMALL,
                  width: "100%",
                  alignSelf: "stretch",
                }}
                onPress={() => {
                  close();
                }}
              >
                {t("global.button-ok")}
              </Button>
            </View>
          </View>
        )}
      </BottomSheet>
    </SafeView>
  );
};

export default email;

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

const sms = () => {
  const { t } = useTranslation();
  const { me, update } = useMe();
  const [isSmsEnabled, setIsSmsEnabled] = useState<boolean>(
    me.settings.sms ?? true
  );
  const hasChanged = isSmsEnabled !== me.settings.sms;

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />
      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("account.sms-settings-title")}
      </Text>
      <Text variant={TextVariant.BodyMedium} color={Color.WHITE}>
        {t("account.sms-settings-description")}
      </Text>
      <Text variant={TextVariant.BodyMedium} color={Color.WHITE}>
        {t("account.sms-settings-description2")}
      </Text>

      <View style={{ gap: Spacing.SMALL, marginVertical: Spacing.SMALL }}>
        <SelectableCard
          title="On"
          variant={CardVariant.SECONDARY}
          selected={isSmsEnabled === true}
          onPress={() => setIsSmsEnabled((prev) => !prev)}
        />
        <SelectableCard
          title="Off"
          variant={CardVariant.SECONDARY}
          selected={isSmsEnabled === false}
          onPress={() => setIsSmsEnabled((prev) => !prev)}
        />
      </View>
      <View style={{ flex: 1 }} collapsable={false} />

      <BottomSheet
        trigger={(show) => (
          <Button
            onPress={() => {
              update({ settings: { sms: isSmsEnabled } }).then(show);
            }}
            enabled={hasChanged}
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
              {t("account.sms-settings-changed")}
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

export default sms;

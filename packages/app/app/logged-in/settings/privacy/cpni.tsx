import React, { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import { useTranslation } from "@/node_modules/react-i18next";

import SafeView from "@/components/SafeView";
import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import Text, { TextVariant } from "@/components/Text";
import SelectableCard, { CardVariant } from "@/components/SelectableCard";
import Button, { ButtonType } from "@/components/Button";
import BottomSheet from "@/components/BottomSheet";
import { useMe } from "@/providers/MeProvider";

import Warning from "@/components/Warning";

const CPNI_URL = "https://www.example.com/terms-and-conditions";

const cpni = () => {
  const [bottomSheetContentType, setBottomSheetContentType] = useState<
    "changed" | "disabled"
  >("changed");
  const { me, update } = useMe();
  const { t } = useTranslation();
  const [isCpniEnabled, setIsCpniEnabled] = useState(me.settings.cpni ?? true);
  const hasChanged = isCpniEnabled !== me.settings.cpni;

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />
      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
      >
        {t("account.cpni-settings-title")}
      </Text>
      <Text variant={TextVariant.BodyMedium} color={Color.WHITE}>
        {t("account.cpni-settings-description")}
      </Text>
      <Pressable onPress={() => Linking.openURL(CPNI_URL)}>
        <Text
          variant={TextVariant.Link}
          color={Color.PRIMARY}
          style={{ marginVertical: Spacing.MEDIUM }}
        >
          {t("account.cpni-settings-link")} {">"}
        </Text>
      </Pressable>
      <Text variant={TextVariant.BodyMedium} color={Color.WHITE}>
        {t("account.cpni-settings-description2")}
      </Text>

      <View style={{ gap: Spacing.SMALL, marginVertical: Spacing.SMALL }}>
        <SelectableCard
          title="On"
          variant={CardVariant.SECONDARY}
          selected={isCpniEnabled === true}
          onPress={() => setIsCpniEnabled((prev) => !prev)}
        />
        <SelectableCard
          title="Off"
          variant={CardVariant.SECONDARY}
          selected={isCpniEnabled === false}
          onPress={() => setIsCpniEnabled((prev) => !prev)}
        />
      </View>
      <View style={{ flex: 1 }} collapsable={false} />

      <BottomSheet
        trigger={(show) => (
          <Button
            enabled={hasChanged}
            onPress={() => {
              if (isCpniEnabled) {
                setBottomSheetContentType("changed");
                update({ settings: { cpni: true } }).then(show);
              } else if (!isCpniEnabled) {
                setBottomSheetContentType("disabled");
                show();
              }
            }}
          >
            {t("global.button-confirm")}
          </Button>
        )}
        imageSuccess={bottomSheetContentType === "changed"}
      >
        {bottomSheetContentType === "changed"
          ? (close) => (
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
                  {t("account.cpni-settings-changed")}
                </Text>

                <Button
                  style={{
                    marginTop: Spacing.SMALL,
                    width: "100%",
                    alignSelf: "stretch",
                  }}
                  onPress={close}
                >
                  {t("global.button-ok")}
                </Button>
              </View>
            )
          : (close) => (
              <View
                style={{
                  gap: Spacing.SMALL,
                  paddingVertical: Spacing.SMALL,
                  display: "flex",
                  justifyContent: "center",
                  width: "95%",
                }}
              >
                <Warning color={Color.RED} />
                <Text variant={TextVariant.H4} color={Color.BLACK}>
                  {t("account.cpni-deactivated-usage")}
                </Text>
                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.BLACK}
                  style={{ marginVertical: Spacing.MEDIUM }}
                >
                  {t("account.cpni-deactivated-usage-msg")}{" "}
                </Text>
                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.BLACK}
                  style={{ marginLeft: Spacing.SMALL }}
                >
                  {"\u2022"} Less tailored offers{"\n"}
                  {"\u2022"} Service is not affected{"\n"}
                  {"\u2022"} You will still receive marketing emails
                </Text>
                <View style={{ marginTop: Spacing.MEDIUM, gap: Spacing.SMALL }}>
                  <Button
                    onPress={close}
                    type={ButtonType.TRANSPARENT_BORD_BLACK}
                    textColor={Color.BLACK}
                  >
                    {t("global.button-cancel")}
                  </Button>
                  <Button
                    onPress={() => {
                      update({ settings: { cpni: false } }).then(() =>
                        setBottomSheetContentType("changed")
                      );
                    }}
                  >
                    {t("global.button-confirm")}
                  </Button>
                </View>
              </View>
            )}
      </BottomSheet>
    </SafeView>
  );
};

export default cpni;

import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import Text, { TextVariant } from "@/components/Text";
import { Linking, Pressable, View } from "react-native";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsPrivacy() {
  const { t } = useTranslation();
  const privacyLink = "https://www.example.com/privacy";
  const termsLink = "https://www.example.com/terms-and-conditions";
  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />
      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("account.privacy-settings-title")}
      </Text>
      <MenuItemLink notButton href="/logged-in/settings/privacy/email">
        {t("account.email-settings")}
      </MenuItemLink>

      <MenuItemLink notButton href="/logged-in/settings/privacy/mail">
        {t("account.mail-settings")}
      </MenuItemLink>

      <MenuItemLink notButton href="/logged-in/settings/privacy/sms">
        {t("account.sms-settings")}
      </MenuItemLink>

      <MenuItemLink notButton href="/logged-in/settings/privacy/cpni">
        {t("account.cpni-settings")}
      </MenuItemLink>
      <View style={{ flex: 1 }} collapsable={false} />
      <View style={{ marginBlock: Spacing.SMALL, gap: Spacing.SMALL }}>
        <Pressable onPress={() => Linking.openURL(privacyLink)}>
          <Text variant={TextVariant.Link} color={Color.PRIMARY}>
            {t("global.privacy-policy")} {">"}
          </Text>
        </Pressable>

        <Pressable onPress={() => Linking.openURL(termsLink)}>
          <Text variant={TextVariant.Link} color={Color.PRIMARY}>
            {t("global.terms-and-conditions")} {">"}
          </Text>
        </Pressable>
      </View>
    </SafeView>
  );
}

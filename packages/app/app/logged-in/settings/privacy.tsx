import { Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsPrivacy() {
  const { t } = useTranslation();
  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />

      <MenuItemLink href="/logged-in/settings/privacy" comingSoon>
        {t("account.email-settings")}
      </MenuItemLink>

      <MenuItemLink href="/logged-in/settings/privacy" comingSoon>
        {t("account.mail-settings")}
      </MenuItemLink>

      <MenuItemLink href="/logged-in/settings/privacy" comingSoon>
        {t("account.sms-settings")}
      </MenuItemLink>

      <MenuItemLink href="/logged-in/settings/privacy" comingSoon>
        {t("account.cpni-settings")}
      </MenuItemLink>
    </SafeView>
  );
}

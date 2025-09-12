import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import Text, { TextVariant } from "@/components/Text";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsAccount() {
  const { t } = useTranslation();
  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />

      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("account.account-settings")}
      </Text>

      <MenuItemLink notButton href="/logged-in/settings/account/billing">
        {t("account.billing")}
      </MenuItemLink>

      <MenuItemLink notButton href="/logged-in/settings/account/personal">
        {t("account.personal-details")}
      </MenuItemLink>

      <MenuItemLink notButton href="/logged-in/settings/account/addresses">
        {t("account.addresses")}
      </MenuItemLink>

      {/* <MenuItemLink notButton href="/logged-in/settings/account" comingSoon>
        Biometric Login
      </MenuItemLink> */}

      {/* <MenuItemLink notButton comingSoon href="/logged-in/settings/privacy">
        Privacy Settings
      </MenuItemLink> */}

      {/* <MenuItemLink notButton href="/logged-in/settings/account" comingSoon>
        Delete account
      </MenuItemLink> */}

      {/* <MenuItemLink
        notButton
        href="/logged-in/settings/account"
        comingSoon
        style={{ marginTop: Spacing.SMALL }}
      >
        Help
      </MenuItemLink> */}
    </SafeView>
  );
}

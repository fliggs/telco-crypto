import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import Text, { TextVariant } from "@/components/Text";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsWallet() {
  const { t } = useTranslation();
  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />

      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("account.wallet-title")}
      </Text>

      <MenuItemLink href="/logged-in/settings/wallet" comingSoon>
        Wallet address
      </MenuItemLink>

      <MenuItemLink href="/logged-in/settings/wallet" comingSoon>
        Recovery phrase
      </MenuItemLink>

      <MenuItemLink href="/logged-in/settings/wallet" comingSoon>
        Security settings
      </MenuItemLink>

      <MenuItemLink href="/logged-in/settings/wallet" comingSoon>
        Restore wallet
      </MenuItemLink>

      <MenuItemLink href="/logged-in/settings/wallet" comingSoon>
        Wallet transfer
      </MenuItemLink>
    </SafeView>
  );
}

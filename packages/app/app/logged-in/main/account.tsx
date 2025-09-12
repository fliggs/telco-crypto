import { router } from "expo-router";
import { useCallback } from "react";
import * as Application from "expo-application";
import { ScrollView, View } from "react-native";
import { useTranslation } from "@/node_modules/react-i18next";

import { Color, Spacing } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useSupport } from "@/providers/SupportProvider";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import MenuItemButton from "@/components/MenuItemButton";
import Text, { TextVariant } from "@/components/Text";
import Header from "@/components/Header";

export default function AccountRedirect() {
  const { signOut, me } = useMe();
  const { showChat } = useSupport();
  const { t } = useTranslation();

  const logout = useCallback(async () => {
    await signOut();
    router.replace("/");
  }, [signOut]);

  return (
    <SafeView gap={Spacing.SMALL} noPaddingBottom dark>
      <Header />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: Spacing.SMALL,
          paddingBottom: Spacing.MEDIUM,
        }}
      >
        <Text
          variant={TextVariant.H4}
          color={Color.WHITE}
          style={{ marginBottom: Spacing.MEDIUM }}
        >
          {t("account.settings-title")}
        </Text>

        <MenuItemLink notButton href="/logged-in/settings/account">
          {t("account.account")}
        </MenuItemLink>

        {/* <MenuItemLink notButton href="/logged-in/settings/wallet" comingSoon>
        Wallet & Security
      </MenuItemLink> */}

        {/* <MenuItemLink notButton href="/logged-in/main/account" comingSoon>
        Rewards
      </MenuItemLink> */}

        <MenuItemLink notButton href="/logged-in/settings/plans">
          {t("account.plans")}
        </MenuItemLink>
        <MenuItemLink notButton href="/logged-in/settings/privacy/privacy">
          {t("account.privacy-settings")}
        </MenuItemLink>

        <View style={{ flex: 1 }} />

        <MenuItemButton notButton onPress={logout}>
          {t("account.logout")}
        </MenuItemButton>

        <Text
          variant={TextVariant.Fineprint}
          color={Color.DARK_GRAY}
          style={{ alignSelf: "center", marginBottom: Spacing.SMALL }}
        >
          v{Application.nativeApplicationVersion} (
          {Application.nativeBuildVersion})
        </Text>

        <MenuItemButton
          primary
          onPress={showChat}
          style={{ paddingBottom: Spacing.SMALL }}
        >
          {t("global.chat-with-us")}
        </MenuItemButton>
      </ScrollView>
    </SafeView>
  );
}

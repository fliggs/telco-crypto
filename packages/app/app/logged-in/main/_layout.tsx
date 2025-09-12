import { Redirect, Tabs } from "expo-router";
import { Color, Spacing, TAB_HEIGHT } from "@/constants";
import { HapticTab } from "@/components/HapticTab";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";

import { Platform, StyleSheet, View } from "react-native";
import Phone from "@/assets/icons/phone.svg";
import Account from "@/assets/icons/account-black.svg";
import Wallet from "@/assets/icons/wallet.svg";
import { useTranslation } from "@/node_modules/react-i18next";

export default function MainLayout() {
  const { isRequiredComplete: isComplete } = useOnboardingProgress();
  const { t } = useTranslation();
  if (!isComplete) {
    console.log("onboarding incomplete, redirecting to onboarding");
    return <Redirect href="/logged-in/onboarding" />;
  }

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "white",
          tabBarActiveBackgroundColor: Color.DARK,
          tabBarInactiveBackgroundColor: Color.DARK,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: Color.DARK,
            width: "60%",
            alignSelf: "center",
            paddingVertical: Spacing.LARGE,
            paddingTop: Platform.OS == "android" ? 10 : 5,
            height: TAB_HEIGHT,
            borderTopWidth: 0,
            overflow: "hidden",
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarItemStyle: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600",
            marginTop: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: `${t("account.plans")}`,
            animation: "shift",
            tabBarIcon: ({ color }) => (
              <Phone color={color} fill={color} width={26} height={26} />
            ),
          }}
        />

        <Tabs.Screen
          name="wallets"
          options={{
            title: `${t("account.wallet")}`,
            animation: "shift",
            tabBarIcon: ({ color }) => (
              <Wallet color={color} fill={color} width={26} height={26} />
            ),
          }}
        />

        <Tabs.Screen
          name="account"
          options={{
            title: `${t("account.account")}`,
            animation: "shift",
            tabBarIcon: ({ color }) => (
              <Account color={color} fill={color} width={26} height={26} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.DARK,
  },
});

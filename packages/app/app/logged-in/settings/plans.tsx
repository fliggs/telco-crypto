import { Color, Spacing } from "@/constants";
import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { formatPhoneNum } from "@/util";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import MenuItemLink from "@/components/MenuItemLink";
import { ScrollView, View } from "react-native";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsPlans() {
  const { t } = useTranslation();
  const { subscriptions } = useSubscriptions();

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: Spacing.MEDIUM,
          paddingBottom: Spacing.MEDIUM,
        }}
      >
        <Text
          variant={TextVariant.H4}
          color={Color.WHITE}
          style={{ marginBottom: Spacing.MEDIUM }}
        >
          {t("account.plan-settings")}
        </Text>

        {subscriptions
          .filter((s) => s.offer.plan.isStandalone)
          .map((sub) => (
            <MenuItemLink
              key={sub.id}
              notButton
              href={`/logged-in/subscriptions/${sub.id}/settings`}
            >
              <View style={{ flexDirection: "column", gap: Spacing.SMALL }}>
                <Text variant={TextVariant.H4} color={Color.WHITE}>
                  {sub.label ??
                    sub.offer.plan.content.title ??
                    sub.offer.plan.name}
                </Text>
                {sub.phoneNumberMsisdn && !sub.label && (
                  <Text variant={TextVariant.Button} color={Color.WHITE}>
                    {formatPhoneNum(sub.phoneNumberMsisdn)}
                  </Text>
                )}
              </View>
            </MenuItemLink>
          ))}

        {/* <MenuItemLink
        notButton
        href="/logged-in/settings/account"
        comingSoon
        style={{ marginTop: Spacing.LARGE }}
      >
        Help
      </MenuItemLink> */}
      </ScrollView>
    </SafeView>
  );
}

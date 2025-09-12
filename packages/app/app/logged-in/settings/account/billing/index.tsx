import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";

import { Color, Spacing } from "@/constants";
import { usePayment } from "@/providers/PaymentProvider";
import { logError } from "@/util";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import MenuItemButton from "@/components/MenuItemButton";
import Text, { TextVariant } from "@/components/Text";
import SvgMastercard from "@/assets/images/mastercard.svg";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsAccountBilling() {
  const { t } = useTranslation();
  const { checkout, getPaymentMethods } = usePayment();

  const [methods, setMethods] = useState<any[]>();

  const refresh = useCallback(() => {
    getPaymentMethods().then(setMethods).catch(logError);
  }, [logError, getPaymentMethods]);

  useEffect(() => refresh(), [refresh]);

  const handleCheckout = useCallback(async () => {
    await checkout();
    refresh();
  }, [checkout, refresh]);

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />

      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {t("account.billing-title")}
      </Text>

      <View
        style={{
          backgroundColor: Color.DARK,
          padding: Spacing.MEDIUM,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          //gap: Spacing.SMALL,
        }}
      >
        <SvgMastercard />
        <Text variant={TextVariant.H4} color={Color.WHITE}>
          {methods
            ? methods.length > 0
              ? `${methods[0].card?.brand} (... ${methods[0].card?.last4})`
              : "N/A"
            : "Loading..."}
        </Text>
        <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
          Active payment method
        </Text>
      </View>

      <MenuItemButton notButton onPress={handleCheckout}>
        Change
      </MenuItemButton>

      <MenuItemLink
        notButton
        href="/logged-in/settings/account/billing/history"
      >
        {t("account.billing-history")}
      </MenuItemLink>

      <MenuItemLink
        notButton
        href="/logged-in/settings/account/billing/creaditBalance"
      >
        {t("account.credit-balance")}
      </MenuItemLink>
      {/* <MenuItemLink
        notButton
        href="/logged-in/settings/account"
        comingSoon
        style={{ marginTop: Spacing.LARGE }}
      >
        Help
      </MenuItemLink> */}
    </SafeView>
  );
}

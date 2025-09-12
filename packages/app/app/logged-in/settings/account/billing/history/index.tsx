import { format } from "date-fns";
import { ScrollView, View } from "react-native";

import { Color, Spacing } from "@/constants";
import { useInvoices } from "@/providers/InvoiceProvider";
import { formatCost, formatPhoneNum } from "@/util";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import MenuItemLink from "@/components/MenuItemLink";
import Text, { TextVariant } from "@/components/Text";
import { useTranslation } from "@/node_modules/react-i18next";

export default function SettingsAccountBillingHistory() {
  const { t } = useTranslation();
  const { invoices } = useInvoices();

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
          {t("account.billing-history-title")}
        </Text>

        {invoices.map((invoice) => (
          <MenuItemLink
            key={invoice.id}
            href={`/logged-in/settings/account/billing/history/${invoice.id}`}
          >
            <View
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                rowGap: Spacing.SMALL,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text color={Color.WHITE}>
                  {format(invoice.invoicedAt, "MM/dd/yyyy")}
                </Text>

                <Text
                  color={Color.WHITE}
                  style={{ marginRight: Spacing.MEDIUM }}
                >
                  {formatCost(invoice.totalCost)}
                </Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  {invoice.order.subscription?.offer?.plan.content.title ??
                    invoice.order.subscription?.offer?.plan.name}
                </Text>

                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.WHITE}
                  style={{ marginRight: Spacing.MEDIUM }}
                >
                  {invoice.order.subscription?.label ??
                    formatPhoneNum(
                      invoice.order.subscription?.phoneNumberMsisdn
                    )}
                </Text>
              </View>
            </View>
          </MenuItemLink>
        ))}
      </ScrollView>
    </SafeView>
  );
}

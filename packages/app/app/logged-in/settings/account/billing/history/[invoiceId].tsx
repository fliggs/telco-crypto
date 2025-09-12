import { useMemo } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { View } from "react-native";

import { Color, Spacing } from "@/constants";
import { useInvoices } from "@/providers/InvoiceProvider";
import { formatCost } from "@/util";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";
import Text, { TextVariant } from "@/components/Text";

export default function SettingsAccountBillingHistoryInvoice() {
  const { invoiceId } = useLocalSearchParams<{ invoiceId: string }>();
  const { invoices } = useInvoices();

  const invoice = useMemo(
    () => invoices.find((inv) => inv.id === invoiceId),
    [invoices, invoiceId]
  );

  if (!invoice) {
    return null;
  }

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />

      <Text
        variant={TextVariant.H2}
        color={Color.WHITE}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        Invoice {format(invoice.invoicedAt, "MM/dd/yyyy")}
      </Text>

      {invoice.items.map((item) => (
        <View
          key={item.name}
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text color={Color.WHITE} style={{ flex: 1 }}>
            {item.title}
          </Text>
          <Text color={Color.WHITE} style={{ alignSelf: "flex-end" }}>
            {formatCost(item.totalCost)}
          </Text>
        </View>
      ))}

      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text variant={TextVariant.Description} color={Color.WHITE}>
          Total
        </Text>
        <Text variant={TextVariant.Description} color={Color.WHITE}>
          {formatCost(invoice.totalCost)}
        </Text>
      </View>
    </SafeView>
  );
}

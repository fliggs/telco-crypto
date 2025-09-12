import { useEffect, useState } from "react";
import { PublicInvoiceWithOrderAndItemsDto } from "api-client-ts";
import { Stack } from "expo-router";

import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { InvoicesProvider } from "@/providers/InvoiceProvider";

export default function SettingsAccountBillingHistoryLayout() {
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const [invoices, setInvoices] = useState<PublicInvoiceWithOrderAndItemsDto[]>(
    []
  );

  useEffect(() => {
    meApi.meFindMyInvoicesV1().then(setInvoices).catch(showError);
  }, [meApi]);

  return (
    <InvoicesProvider invoices={invoices}>
      <Stack screenOptions={{ headerShown: false }} />
    </InvoicesProvider>
  );
}

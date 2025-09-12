import { router } from "expo-router";
import { useCallback } from "react";

import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useOrder } from "@/providers/OrderProvider";
import MsisdnSelectionStep2 from "@/components/MsisdnSelectionStep2";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

export default function NewOrderMsisdnStep2() {
  const { order, update } = useOrder();
  const { telcoApi } = useApi();
  const { showError } = useErrorSheet();

  const onContinue = useCallback(
    async (num: string) => {
      try {
        await update({
          portIn: { isPortingIn: true, msisdn: num },
        });

        router.push({
          pathname: "/logged-in/orders/[orderId]/msisdn/step3",
          params: { orderId: order.id, num },
        });
      } catch (err) {
        showError({
          error: err,
        });
      }
    },
    [telcoApi, showError, update, order]
  );

  return (
    <SafeView dark>
      <Header showBack />
      <MsisdnSelectionStep2 onContinue={onContinue} />
    </SafeView>
  );
}

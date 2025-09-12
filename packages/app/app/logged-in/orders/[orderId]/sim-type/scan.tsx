import React, { useCallback } from "react";
import { SimType } from "api-client-ts";

import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useOrder } from "@/providers/OrderProvider";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";
import SimCardScanScreen from "@/components/SimCardScanScreen";
import { router } from "expo-router";

export default function OnboardingOrderSimTypeScan() {
  const { order } = useOrder();
  const { showError } = useErrorSheet();
  const { update } = useOrder();

  const onContinue = useCallback(
    async (iccid: string) => {
      try {
        await update({ simSelection: { simType: SimType.PSim, iccid } });
        router.push({
          pathname: "/logged-in/orders/[orderId]/confirm",
          params: { orderId: order.id },
        });
      } catch (err) {
        showError({ error: err });
      }
    },
    [update, order]
  );

  return (
    <SafeView dark>
      <Header showBack />

      <SimCardScanScreen onContinue={onContinue} />
    </SafeView>
  );
}

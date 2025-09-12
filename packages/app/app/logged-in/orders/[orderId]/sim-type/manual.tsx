import { useCallback } from "react";
import { router } from "expo-router";

import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useOrder } from "@/providers/OrderProvider";
import SimSelectionManual from "@/components/SimSelectionManual";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

export default function NewOrderSimTypeManual() {
  const { showError } = useErrorSheet();
  const { order } = useOrder();

  const onContinue = useCallback(
    (supported: boolean | "existing") => {
      if (supported === true) {
        router.push({
          pathname: "/logged-in/orders/[orderId]/sim-type/esim",
          params: { orderId: order.id, supported: "true", phone: "other" },
        });
      } else if (supported === false) {
        router.push({
          pathname: "/logged-in/orders/[orderId]/sim-type/shipping",
          params: { orderId: order.id },
        });
      } else {
        showError({
          error: "Please select whether your device supports eSIM.",
        });
      }
    },
    [showError, order]
  );

  return (
    <SafeView dark>
      <Header showBack />

      <SimSelectionManual onContinue={onContinue} />
    </SafeView>
  );
}

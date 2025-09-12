import { router } from "expo-router";
import { useCallback } from "react";

import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { checkESimSupport } from "@/util";
import { useOrder } from "@/providers/OrderProvider";
import SimSelection from "@/components/SimSelection";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

export default function NewOrderSimType() {
  const { showError } = useErrorSheet();
  const { order } = useOrder();

  const onContinue = useCallback(
    async (device: "this" | "other" | "existing") => {
      try {
        if (device === "this") {
          const res = await checkESimSupport();
          if (typeof res === "boolean") {
            router.push({
              pathname: "/logged-in/orders/[orderId]/sim-type/esim",
              params: { orderId: order.id, supported: `${res}`, phone: "this" },
            });
          }
        } else if (device === "other") {
          router.push({
            pathname: "/logged-in/orders/[orderId]/sim-type/manual",
            params: { orderId: order.id },
          });
        } else if (device === "existing") {
          router.push({
            pathname: `/logged-in/orders/[orderId]/sim-type/scan`,
            params: { orderId: order.id },
          });
        }
      } catch (err) {
        showError({ error: err });
      }
    },
    [order]
  );

  return (
    <SafeView dark>
      <Header showBack />

      <SimSelection onContinue={onContinue} />
    </SafeView>
  );
}

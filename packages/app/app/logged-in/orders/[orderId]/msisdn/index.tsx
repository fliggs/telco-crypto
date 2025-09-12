import { useCallback } from "react";
import { router } from "expo-router";

import { useOrder } from "@/providers/OrderProvider";
import SafeView from "@/components/SafeView";
import MsisdnSelection from "@/components/MsisdnSelection";
import Header from "@/components/Header";

export default function NewOrderMsisdn() {
  const { order, update } = useOrder();

  const onContinue = useCallback(
    async (option: "new" | "bring") => {
      if (option === "bring") {
        router.push({
          pathname: "/logged-in/orders/[orderId]/msisdn/step2",
          params: { orderId: order.id },
        });
      } else if (option === "new") {
        await update({ portIn: { isPortingIn: false } });
        router.push({
          pathname: "/logged-in/orders/[orderId]/sim-type",
          params: { orderId: order.id },
        });
      }
    },
    [update, order]
  );

  return (
    <SafeView dark>
      <Header showBack />

      <MsisdnSelection onContinue={onContinue} />
    </SafeView>
  );
}

import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { SimType } from "api-client-ts";

import { useOrder } from "@/providers/OrderProvider";
import SimSelectionESim from "@/components/SimSelectionESim";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

export default function NewOrderSimTypeESim() {
  const { phone, supported } = useLocalSearchParams<{
    phone: "this" | "other";
    supported: "true" | "false";
  }>();
  const { order, update } = useOrder();

  const onPress = useCallback(async () => {
    await update({ simSelection: { simType: SimType.ESim } });
    router.push({
      pathname: "/logged-in/orders/[orderId]/confirm",
      params: { orderId: order.id },
    });
  }, [update, order]);

  return (
    <SafeView dark>
      <Header showBack />
      <SimSelectionESim
        esimSupported={supported === "true"}
        thisPhone={phone === "this"}
        onContinue={onPress}
      />
    </SafeView>
  );
}

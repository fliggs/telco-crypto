import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

import { useOrder } from "@/providers/OrderProvider";
import MsisdnSelectionStep3 from "@/components/MsisdnSelectionStep3";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

export default function NewOrderMsisdnStep3() {
  const { num } = useLocalSearchParams<{ num: string }>();
  const { order, update } = useOrder();

  const onContinue = useCallback(
    async (
      doLater: boolean,
      ospAccountId: string,
      ospPostalCode: string,
      ospPassword: string
    ) => {
      await update({
        portIn: {
          isPortingIn: !doLater,
          msisdn: num,
          accountNumber: ospAccountId,
          postalCode: ospPostalCode,
          password: ospPassword,
        },
      });
      router.push({
        pathname: "/logged-in/orders/[orderId]/sim-type",
        params: { orderId: order.id },
      });
    },
    [update, order, num]
  );

  return (
    <SafeView dark>
      <Header showBack />
      <MsisdnSelectionStep3 onContinue={onContinue} />
    </SafeView>
  );
}

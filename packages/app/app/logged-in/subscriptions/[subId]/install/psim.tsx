import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { OrderStatus, OrderStepStatus, OrderType } from "api-client-ts";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { useCallback, useState } from "react";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import SimCardScanScreen from "@/components/SimCardScanScreen";
import LoadingComponent from "@/components/LoadingComponent";

export default function SubscriptionsInstallPSim() {
  const { showError } = useErrorSheet();
  const { subId } = useLocalSearchParams<{ subId: string }>();
  const { subscription, extra, refresh } = useSubscriptions(subId);
  const { meApi } = useApi();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = useCallback(
    async (iccid: string) => {
      try {
        setIsLoading(true);
        const order = extra?.orders?.find(
          (o) =>
            o.type === OrderType.AddPlan &&
            o.status === OrderStatus.Error &&
            o.currentStep?.type === "SIM" &&
            o.currentStep.error === "psim_missing_iccid"
        );
        if (!order) {
          throw new Error("order_not_ready");
        }
        await meApi.meUpdateMyOrderStepAttachSimV1({
          orderId: order.id,
          stepId: "legacy",
          updateMyOrderStepAttachSimDto: {
            iccid,
          },
        });
        // TODO: Actually check for order updates instead of this in the future
        await new Promise<void>((res) => setTimeout(res, 10000));
        await refresh(true);
        router.back();
      } catch (err) {
        showError({ error: err });
      } finally {
        setIsLoading(false);
      }
    },
    [meApi, extra]
  );

  if (!subscription) {
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      {isLoading ? (
        <LoadingComponent />
      ) : (
        <SimCardScanScreen onContinue={handleContinue} />
      )}
    </SafeView>
  );
}

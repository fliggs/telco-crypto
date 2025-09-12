import { OrderStatus } from "api-client-ts";
import { useCallback, useEffect } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { useOrder } from "@/providers/OrderProvider";
import LoadingComponent from "@/components/LoadingComponent";
import AwesomeScreen from "@/components/AwesomeScreen";
import Text from "@/components/Text";
import SafeView from "@/components/SafeView";
import SignScreen from "@/components/SignScreen";

const STATI: Set<OrderStatus> = new Set([
  OrderStatus.Done,
  OrderStatus.Error,
  OrderStatus.Aborted,
]);

export default function OrderProcessScreen() {
  const { awesome } = useLocalSearchParams<{ awesome: string }>();
  const { refresh: refreshSubs } = useSubscriptions();
  const { order, refresh } = useOrder();

  const isComplete = !order || STATI.has(order.status);
  const showAwesome = awesome === "1";
  const showWalletSign =
    order.status === OrderStatus.Error && order.currentStep?.type === "SIGN";

  useEffect(() => {
    if (!isComplete) {
      const timer = setInterval(refresh, 2000);
      return () => clearInterval(timer);
    }
  }, [refresh, isComplete]);

  const handleDone = useCallback(async () => {
    await refreshSubs();
    router.navigate(`/logged-in/main`);
  }, [refreshSubs]);

  if (!isComplete) {
    return <LoadingComponent processing={true} />;
  }

  return showWalletSign ? (
    <SignScreen orderId={order.id} message={order.signing?.message} />
  ) : showAwesome ? (
    <AwesomeScreen onContinue={handleDone} />
  ) : (
    <Redirect href="/logged-in/main" />
  );
}

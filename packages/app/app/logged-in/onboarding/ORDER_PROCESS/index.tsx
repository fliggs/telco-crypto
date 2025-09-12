import { OrderStatus } from "api-client-ts";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import LoadingComponent from "@/components/LoadingComponent";
import AwesomeScreen from "@/components/AwesomeScreen";

const STATI: Set<OrderStatus> = new Set([
  OrderStatus.Done,
  OrderStatus.Error,
  OrderStatus.Aborted,
]);

export default function OnboardingOrderProcess() {
  const { refresh: refreshSubs } = useSubscriptions();
  const { startStage, completeStage } = useOnboardingProgress();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { order, refresh, clear } = useCurrentOrder();

  const isComplete = !order || STATI.has(order.status);

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  useEffect(() => {
    if (!isComplete) {
      const timer = setInterval(refresh, 2000);
      return () => clearInterval(timer);
    }
  }, [refresh, isComplete]);

  const handleDone = useCallback(async () => {
    await refreshSubs();
    await completeStage(stage);
    clear();
  }, [completeStage, stage, refreshSubs, clear]);

  return isComplete ? (
    <AwesomeScreen onContinue={handleDone} />
  ) : (
    <LoadingComponent processing={true} />
  );
}

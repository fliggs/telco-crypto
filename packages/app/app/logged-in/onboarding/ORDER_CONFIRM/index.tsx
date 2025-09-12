import { router, useLocalSearchParams } from "expo-router";
import {
  PublicAddressDto,
  PublicTaxItemDto,
  AddressType,
  OnboardingStageType,
} from "api-client-ts";
import Decimal from "decimal.js";
import { useCallback, useEffect, useState } from "react";

import { Color } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { extractErrorMsg } from "@/util";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { usePayment } from "@/providers/PaymentProvider";
import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import OrderConfirm from "@/components/OrderConfirm";
import Text, { TextVariant } from "@/components/Text";
import { useTranslation } from "@/node_modules/react-i18next";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";

export default function OnboardingOrderConfirm() {
  const { t } = useTranslation();
  const { meApi } = useApi();
  const { order } = useCurrentOrder();
  const { checkout } = usePayment();
  const { refresh } = useSubscriptions();
  const { showError } = useErrorSheet();
  const [addresses, setAddresses] = useState<PublicAddressDto[]>([]);
  const [taxes, setTaxes] = useState<PublicTaxItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { requiredStages } = useOnboardingStages();
  const { startStage, completeStage } = useOnboardingProgress();
  const { stage } = useLocalSearchParams<{ stage: string }>();

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  useEffect(() => {
    if (!order) {
      return;
    }

    Promise.allSettled([
      meApi.meFindMyOrderTaxesV1({ orderId: order.id }).then(setTaxes),
      meApi
        .meFindMyAddressesV1()
        .then(setAddresses)
        .catch(() => null),
    ]).finally(() => setIsLoading(false));
  }, [meApi, order]);

  const handleDone = useCallback(async () => {
    if (!order) {
      return;
    }

    setIsLoading(true);

    const taxPrice = taxes.reduce(
      (acc, tax) => Decimal(tax.cost).plus(acc),
      new Decimal(0)
    );

    try {
      await meApi.meUpdateMyOrderV1({
        orderId: order.id,
        updateMyOrderDto: { confirm: true },
      });
      await refresh();
      await completeStage(stage);
    } catch (err) {
      const msg = await extractErrorMsg(err);
      if (msg === "payment_not_setup") {
        try {
          await checkout();
          await meApi.meUpdateMyOrderV1({
            orderId: order.id,
            updateMyOrderDto: { confirm: true },
          });
          await refresh();
          await completeStage(stage);
        } catch (err2) {
          const msg2 = await extractErrorMsg(err);
          if (msg2 !== "payment_not_setup") {
            showError({
              error: err2,
            });
          }
        }
      } else {
        showError({
          error: msg,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [completeStage, stage, order, taxes]);

  return (
    <SafeView dark>
      <OnboardingHeader />
      <Text variant={TextVariant.H3} color={Color.WHITE}>
        {t("onboarding.your-order")}
      </Text>

      {/* <Text color={Color.WHITE} style={{ marginBottom: Spacing.MEDIUM }}>
        Plan automatically renews every 30 days. Cancel it anytime in your plan
        settings.
      </Text> */}

      {/* TODO: The "router.dismiss(4)" is hardcoded, but should instead depend on our onboarding flow */}
      <OrderConfirm
        isLoading={isLoading}
        order={order}
        taxes={taxes}
        address={addresses.find((a) => a.type === AddressType.Billing)}
        shippingAddress={addresses.find((a) => a.type === AddressType.Shipping)}
        onChange={() =>
          router.dismissTo({
            pathname: `/logged-in/onboarding/ORDER_PLAN`,
            params: {
              stage: requiredStages.find(
                (s) => s.type === OnboardingStageType.OrderPlan
              )?.name,
            },
          })
        }
        onDone={handleDone}
      />
    </SafeView>
  );
}

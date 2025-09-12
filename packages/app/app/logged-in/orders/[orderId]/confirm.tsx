import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { AddressType, PublicAddressDto, PublicTaxItemDto } from "api-client-ts";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { usePayment } from "@/providers/PaymentProvider";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { extractErrorMsg } from "@/util";
import { useMe } from "@/providers/MeProvider";
import { Color } from "@/constants";
import { useOrder } from "@/providers/OrderProvider";
import OrderConfirm from "@/components/OrderConfirm";
import Text, { TextVariant } from "@/components/Text";
import LoadingComponent from "@/components/LoadingComponent";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

export default function OrderConfirmScreen() {
  const { checkout } = usePayment();
  const { refresh } = useSubscriptions();
  const { showError } = useErrorSheet();
  const { order, update } = useOrder();
  const { meApi } = useApi();
  const { me } = useMe();

  const [addresses, setAddresses] = useState<PublicAddressDto[]>([]);
  const [taxes, setTaxes] = useState<PublicTaxItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    try {
      await update({
        confirm: true,
      });
      await refresh();
      router.navigate({
        pathname: "/logged-in/orders/[orderId]/process",
        params: {
          orderId: order.id,
          awesome: order?.offer?.plan.isStandalone ? "1" : "0",
        },
      });
    } catch (err) {
      const msg = await extractErrorMsg(err);
      if (msg === "payment_not_setup") {
        try {
          await checkout();
          await update({
            confirm: true,
          });
          await refresh();
          router.navigate({
            pathname: "/logged-in/orders/[orderId]/process",
            params: {
              orderId: order.id,
              awesome: order?.offer?.plan.isStandalone ? "1" : "0",
            },
          });
        } catch (err) {
          showError({
            error: err,
          });
        }
      } else {
        showError({
          error: err,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [order, me]);

  if (!order) {
    return <LoadingComponent processing />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Your order.
      </Text>

      {/* TODO: The router.dismiss(3) is hardcoded, but should be more flexible */}
      <OrderConfirm
        isLoading={isLoading}
        order={order}
        taxes={taxes}
        address={addresses.find((a) => a.type === AddressType.Billing)}
        shippingAddress={addresses.find((a) => a.type === AddressType.Shipping)}
        onChange={() => router.dismiss(3)}
        onDone={handleDone}
      />
    </SafeView>
  );
}

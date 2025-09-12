import { OrderType, PublicOfferWithPlanWithVolumesDto } from "api-client-ts";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useApi } from "@/providers/ApiProvider";
import { useOffers } from "@/providers/OffersProvider";
import { Color, Spacing } from "@/constants";
import Text, { TextVariant } from "@/components/Text";
import Header from "@/components/Header";
import OfferPicker from "@/components/OfferPicker";
import SafeView from "@/components/SafeView";
import Button from "@/components/Button";

export default function NewOrder() {
  const { meApi } = useApi();
  const { subId } = useLocalSearchParams<{ subId: string }>();
  const { isLoading, offers, refresh } = useOffers();
  const { showError } = useErrorSheet();

  const [selOffer, setSelOffer] = useState<PublicOfferWithPlanWithVolumesDto>();

  const standaloneOffers = useMemo(
    () => offers.filter((o) => o.plan.isStandalone),
    [offers]
  );

  const handleDone = useCallback(async () => {
    if (!selOffer) {
      return;
    }

    try {
      const order = await meApi.meCreateMyOrderV1({
        createMyOrderDto: {
          type: OrderType.ChangePlan,
          offerId: selOffer.id,
          subscriptionId: subId,
        },
      });
      router.push({
        pathname: "/logged-in/orders/[orderId]/confirm",
        params: { orderId: order.id },
      });
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, subId, selOffer]);

  return (
    <SafeView dark>
      <Header showBack />

      <OfferPicker
        offers={standaloneOffers}
        offer={selOffer}
        type={OrderType.AddPlan}
        isRefreshing={isLoading}
        onRefresh={refresh}
        onChange={setSelOffer}
      >
        <Text
          variant={TextVariant.H3}
          color={Color.WHITE}
          style={{ marginBottom: Spacing.MEDIUM }}
        >
          Pick your plan.
        </Text>

        <Text color={Color.WHITE}>
          Built on the leading 5G network in the US.
        </Text>
      </OfferPicker>

      <View style={{ flex: 1 }} />

      <Button enabled={!!selOffer} onPress={handleDone}>
        Continue
      </Button>
    </SafeView>
  );
}

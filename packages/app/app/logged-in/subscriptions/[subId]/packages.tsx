import {
  OrderType,
  PublicOfferWithPlanDto,
  PublicOfferWithPlanWithVolumesDto,
} from "api-client-ts";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { Color, Spacing } from "@/constants";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";
import Text, { TextVariant } from "@/components/Text";
import Button from "@/components/Button";
import OfferPicker from "@/components/OfferPicker";
import { useMe } from "@/providers/MeProvider";
import { formatPhoneNum } from "@/util";

export default function SubscriptionsPackages() {
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const { subId, type } = useLocalSearchParams<{
    subId: string;
    type: string;
  }>();
  const [offers, setOffers] = useState<PublicOfferWithPlanWithVolumesDto[]>();
  const [selOffer, setSelOffer] = useState<PublicOfferWithPlanWithVolumesDto>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { subscriptions } = useSubscriptions();
  const { me } = useMe();
  const sub = useMemo(
    () => subscriptions.find((s) => s.id === subId),
    [subscriptions, subId]
  );

  const handleTitle = (type: string) => {
    switch (type) {
      case "roaming":
        setTitle("Roaming pass");
        setDescription("Stay connected while travelling the world.");
        break;
      case "international":
        setTitle("International credit");
        setDescription("Stay in touch with friends and family abroad.");
        break;
      default:
        setTitle("Data booster");
        setDescription("Add more high speed data");
        break;
    }
  };
  useEffect(() => {
    if (!sub) {
      return;
    }

    meApi.meFindMySubscriptionOffersV1({ subId: sub.id }).then((newOffers) => {
      const offers = newOffers.filter((o) => o.content.tags?.includes(type));
      setOffers(offers);
      handleTitle(type);
      setSelOffer(offers[0]);
    });
  }, [sub]);

  const handleDone = useCallback(async () => {
    if (!selOffer) {
      return;
    }

    try {
      const order = await meApi.meCreateMyOrderV1({
        createMyOrderDto: {
          type: OrderType.AddPlan,
          subscriptionId: subId,
          offerId: selOffer.id,
        },
      });
      router.navigate(`/logged-in/orders/${order.id}/confirm`);
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [subId, selOffer]);

  if (!sub) {
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <SafeView dark>
      <Header showBack />
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginBottom: Spacing.MEDIUM,
        }}
      >
        <Text variant={TextVariant.H4} color={Color.WHITE}>
          {sub.label ?? `${me.firstName} ${me.lastName}`}
        </Text>

        <Text color={Color.WHITE}>{formatPhoneNum(sub.phoneNumberMsisdn)}</Text>
      </View>

      <View style={{ gap: Spacing.SMALL }}>
        <Text variant={TextVariant.H4} color={Color.WHITE}>
          {title}
        </Text>
        <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
          {description}
        </Text>

        {offers && offers.length > 0 && selOffer?.id && (
          <OfferPicker
            offers={offers}
            offer={selOffer}
            onChange={setSelOffer}
            packageType={type}
          />
        )}
      </View>
      <View style={{ flex: 1 }} />

      <Button
        enabled={!!selOffer}
        onPress={handleDone}
        style={{ marginBottom: Spacing.MEDIUM }}
      >
        {type == "international" ? "Top Up Now" : "Add package"}
      </Button>
    </SafeView>
  );
}

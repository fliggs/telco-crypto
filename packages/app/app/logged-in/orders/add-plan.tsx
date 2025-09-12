import {
  OrderType,
  PublicOfferWithPlanWithVolumesDto,
  PublicPromoCodeWithOffersDto,
} from "api-client-ts";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { RectButton } from "react-native-gesture-handler";

import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useApi } from "@/providers/ApiProvider";
import { useOffers } from "@/providers/OffersProvider";
import { Color, Spacing } from "@/constants";
import Text, { TextVariant } from "@/components/Text";
import Header from "@/components/Header";
import OfferPicker from "@/components/OfferPicker";
import SafeView from "@/components/SafeView";
import Button from "@/components/Button";
import BottomSheet from "@/components/BottomSheet";
import TextInput from "@/components/TextInput";
import { useMe } from "@/providers/MeProvider";

export default function AddPlanScreen() {
  const { me } = useMe();
  const { meApi, promoCodeApi } = useApi();
  const { isLoading, offers, refresh } = useOffers();
  const { showError } = useErrorSheet();
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<PublicPromoCodeWithOffersDto>();
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
          type: OrderType.AddPlan,
          offerId: selOffer.id,
          promoCodeId: promo?.id,
        },
      });
      router.push({
        pathname: "/logged-in/orders/[orderId]/msisdn",
        params: { orderId: order.id },
      });
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, selOffer]);

  const handlePromoCode = useCallback(
    (close: () => void) => {
      return async () => {
        try {
          const promo = await promoCodeApi.promoCodeFindByCodeV1({
            code: promoCode,
          });
          setPromo(promo);
          close();
        } catch (err) {
          showError({ error: err });
          setPromo(undefined);
        }
      };
    },
    [promoCode]
  );

  return (
    <SafeView dark>
      <Header showBack />

      <OfferPicker
        offers={promo?.offers ?? standaloneOffers}
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

        {me.isPromoCodeFieldEnabled && (
          <>
            {promo ? (
              <RectButton onPress={() => setPromo(undefined)}>
                <Text
                  variant={TextVariant.Link}
                  style={{ marginBottom: Spacing.MEDIUM }}
                >
                  Remove promo "{promoCode}" {">"}
                </Text>
              </RectButton>
            ) : (
              <BottomSheet
                trigger={(show) => (
                  <RectButton onPress={show}>
                    <Text
                      variant={TextVariant.Link}
                      style={{ marginBottom: Spacing.MEDIUM }}
                    >
                      Apply a promo code {">"}
                    </Text>
                  </RectButton>
                )}
              >
                {(close) => (
                  <>
                    <TextInput
                      placeholder="Promo code"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect={false}
                    />

                    <Button
                      enabled={promoCode.length >= 3}
                      onPress={handlePromoCode(close)}
                    >
                      Apply
                    </Button>

                    <View
                      collapsable={false}
                      style={{ marginBottom: Spacing.SMALL }}
                    />
                  </>
                )}
              </BottomSheet>
            )}
          </>
        )}

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

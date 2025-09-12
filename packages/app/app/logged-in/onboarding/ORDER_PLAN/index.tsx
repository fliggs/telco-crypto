import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useTranslation } from "@/node_modules/react-i18next";
import {
  OrderType,
  PublicOfferWithPlanWithVolumesDto,
  PublicPromoCodeWithOffersDto,
} from "api-client-ts";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import { useOffers } from "@/providers/OffersProvider";
import { useSupport } from "@/providers/SupportProvider";
import { Color, Spacing } from "@/constants";
import OfferPicker from "@/components/OfferPicker";
import Text, { TextVariant } from "@/components/Text";
import Button from "@/components/Button";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";
import { useApi } from "@/providers/ApiProvider";
import { useMe } from "@/providers/MeProvider";
import { RectButton } from "react-native-gesture-handler";
import BottomSheet from "@/components/BottomSheet";
import TextInput from "@/components/TextInput";

export default function OnboardingOrderPlan() {
  const { promoCodeApi } = useApi();
  const { t } = useTranslation();
  const { me } = useMe();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { startStage, completeStage } = useOnboardingProgress();
  const { showError } = useErrorSheet();
  const { order, create, update } = useCurrentOrder();
  const { isLoading, offers, refresh } = useOffers();
  const { showChat } = useSupport();
  const [promoCode, setPromoCode] = useState("");
  const [promo, setPromo] = useState<PublicPromoCodeWithOffersDto>();
  const [selOffer, setSelOffer] = useState<PublicOfferWithPlanWithVolumesDto>();

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  const standaloneOffers = useMemo(
    () => offers.filter((o) => o.plan.isStandalone),
    [offers]
  );

  useEffect(() => {
    if (order?.offer?.id) {
      const offer =
        promo?.offers.find((p) => p.id === order.offer?.id) ??
        standaloneOffers.find((o) => o.id === order.offer?.id);
      if (offer) {
        setSelOffer(offer);
      } else {
        setSelOffer(standaloneOffers[0]);
      }
    }
  }, [standaloneOffers, promo, order?.offer?.id]);

  const handleDone = useCallback(async () => {
    if (!selOffer) {
      return;
    }

    try {
      if (order) {
        await update({ offerId: selOffer.id, promoCodeId: promo?.id });
      } else {
        await create({
          type: OrderType.AddPlan,
          offerId: selOffer.id,
          promoCodeId: promo?.id,
        });
      }
      await completeStage(stage);
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [completeStage, stage, update, create, order, selOffer]);

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
      <OnboardingHeader />

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
          {t("onboarding.pick-your-plan")}
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

        <Text
          variant={TextVariant.Description}
          color={Color.WHITE}
          style={{ marginBottom: Spacing.SMALL }}
        >
          {t("onboarding.pick-your-plan-msg")}
        </Text>
      </OfferPicker>

      <View style={{ flexGrow: 1 }} />

      <Text
        variant={TextVariant.Link}
        style={{ paddingVertical: Spacing.SMALL }}
        onPress={showChat}
      >
        {t("global.live-chat-support")} {">"}
      </Text>

      <Button enabled={!!selOffer} onPress={handleDone}>
        {t("global.button-continue")}
      </Button>
    </SafeView>
  );
}

import { Redirect, router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { useCallback, useState } from "react";
import { OrderType, SubscriptionStatus } from "api-client-ts";
import { format, sub } from "date-fns";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { useApi } from "@/providers/ApiProvider";
import { Color, Spacing } from "@/constants";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Button, { ButtonType } from "@/components/Button";
import MenuItemButton from "@/components/MenuItemButton";
import SubscriptionDetails from "@/components/SubscriptionDetails";
import Text, { TextVariant } from "@/components/Text";
import BottomSheet from "@/components/BottomSheet";
import MenuItemLink from "@/components/MenuItemLink";
import { useBottomSheet } from "@/providers/BottomSheetProvider";
import Warning from "@/components/Warning";

export default function SubscriptionsSettingsPlan() {
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const { closeCurrent } = useBottomSheet();
  const [showSuccessSheet, setShowSuccessSheet] = useState(false);
  const { subId } = useLocalSearchParams<{ subId: string }>();

  const { subscription, refresh } = useSubscriptions(subId);

  const portOut = useCallback(async () => {
    try {
      const order = await meApi.meCreateMyOrderV1({
        createMyOrderDto: { type: OrderType.PortOut, subscriptionId: subId },
      });
      router.navigate({
        pathname: `/logged-in/orders/[orderId]/process`,
        params: { orderId: order.id },
      });
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, subId]);

  const confirmCancelSub = useCallback(async () => {
    try {
      await meApi.meDeleteMySubscriptionV1({ subId });
      await refresh();
      setShowSuccessSheet(true);
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, subId]);

  const uncancelSub = useCallback(async () => {
    try {
      await meApi.meUncancelMySubscriptionV1({ subId });
      await refresh();
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, subId]);

  if (!subscription) {
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <SubscriptionDetails sub={subscription} />

      <View
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: Spacing.SMALL,
          marginTop: Spacing.MEDIUM,
        }}
      >
        <Text variant={TextVariant.H4} color={Color.WHITE}>
          Manage plan.
        </Text>

        <MenuItemLink
          href={`/logged-in/subscriptions/${subId}/change-plan`}
          notButton
        >
          Change plan
        </MenuItemLink>

        <MenuItemButton notButton onPress={portOut}>
          Port Out
        </MenuItemButton>

        {subscription.status === SubscriptionStatus.Active ? (
          <BottomSheet
            trigger={(show) => (
              <MenuItemButton notButton onPress={show}>
                Cancel plan
              </MenuItemButton>
            )}
          >
            {(close) => (
              <>
                <Warning color={Color.RED} />
                <View
                  style={{
                    justifyContent: "flex-start",
                    gap: Spacing.MEDIUM,
                  }}
                >
                  <Text
                    variant={TextVariant.H4}
                    color={Color.BLACK}
                    style={{ marginVertical: Spacing.MEDIUM }}
                  >
                    You are about to cancel this plan.
                  </Text>

                  <Text color={Color.BLACK}>Are you sure?</Text>
                  {subscription.currentPeriod?.endsAt && (
                    <Text color={Color.BLACK}>
                      Your plan will stay active until{" "}
                      {format(subscription.currentPeriod.endsAt, "MM/dd/yyyy")}.
                    </Text>
                  )}
                  <Text color={Color.BLACK}>It will not renew anymore.</Text>
                  <Text color={Color.BLACK}>
                    You can still activate additional packages until then.
                  </Text>
                </View>
                <Button
                  type={ButtonType.SECONDARY_INV}
                  style={{ alignSelf: "stretch" }}
                  onPress={() => close()}
                >
                  Cancel
                </Button>

                <BottomSheet
                  trigger={(show) => (
                    <Button
                      style={{
                        alignSelf: "stretch",
                        marginBottom: Spacing.MEDIUM,
                      }}
                      onPress={confirmCancelSub}
                    >
                      Confirm
                    </Button>
                  )}
                  imageSuccess
                >
                  <View style={{ alignItems: "flex-start" }}>
                    <Text variant={TextVariant.H4}>
                      Your plan has been cancelled.
                    </Text>
                    <Text variant={TextVariant.BodySmall}>
                      The plan will remain active until the plan renewal date.
                    </Text>
                    <Button
                      onPress={() => {
                        closeCurrent();
                        setShowSuccessSheet(false);
                      }}
                    >
                      OK
                    </Button>
                  </View>
                </BottomSheet>
              </>
            )}
          </BottomSheet>
        ) : subscription.status === SubscriptionStatus.Cancelled ? (
          <MenuItemButton notButton onPress={uncancelSub}>
            Undo Cancellation
          </MenuItemButton>
        ) : null}

        {/* <MenuItemLink
          href={`/logged-in/subscriptions/${subscription.id}/settings/plan`}
          comingSoon
          notButton
        >
          Port-out PIN
        </MenuItemLink> */}
      </View>

      <View style={{ flex: 1 }}></View>
      {/* <MenuItemLink
        notButton
        href="/logged-in/settings/account"
        comingSoon
        style={{ marginTop: Spacing.LARGE }}
      >
        Help
      </MenuItemLink> */}
    </SafeView>
  );
}

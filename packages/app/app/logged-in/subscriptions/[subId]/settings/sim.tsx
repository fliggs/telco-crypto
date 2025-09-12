import { Redirect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { RectButton } from "react-native-gesture-handler";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import SubscriptionDetails from "@/components/SubscriptionDetails";
import Text, { TextVariant } from "@/components/Text";
import MenuItemLink from "@/components/MenuItemLink";

import SvgCopy from "@/assets/icons/copy.svg";
import BottomSheet from "@/components/BottomSheet";
import MenuItemButton from "@/components/MenuItemButton";
import Button from "@/components/Button";
import { useBottomSheet } from "@/providers/BottomSheetProvider";

export default function SubscriptionsSettingsSim() {
  const { subId } = useLocalSearchParams<{ subId: string }>();
  const { closeCurrent } = useBottomSheet();
  const { subscription, extra } = useSubscriptions(subId);

  if (!subscription) {
    return <Redirect href="/logged-in/main" />;
  }

  console.log("{extra?.simDetails?.", extra?.simDetails)
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
          Manage SIM.
        </Text>

        {subscription.simIccid && (
          <RectButton
            onPress={() => Clipboard.setStringAsync(subscription.simIccid!)}
            underlayColor="white"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text color={Color.GRAY}>ICCID: {subscription.simIccid}</Text>
            <SvgCopy stroke={Color.WHITE} />
          </RectButton>
        )}

        {
          extra?.simDetails?.puk && extra?.simDetails?.pin &&
          <BottomSheet
            imageSuccess={true}
            trigger={(show) => (
              <MenuItemButton notButton onPress={show}>
                View PIN/PUK
              </MenuItemButton>
            )}
          >
            <View
              style={{
                justifyContent: "flex-start",
                width: "100%",
                gap: Spacing.SMALL,
              }}
            >
              <Text
                variant={TextVariant.H4}
                color={Color.BLACK}
                style={{ marginBottom: Spacing.SMALL }}
              >
                Your PIN/PUK
              </Text>

              <RectButton
                onPress={() =>
                  Clipboard.setStringAsync(extra?.simDetails?.pin ?? "????")
                }
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                  PIN: {extra?.simDetails?.pin ?? "????"}
                </Text>
                <SvgCopy stroke={Color.BLACK} />
              </RectButton>

              <RectButton
                onPress={() =>
                  Clipboard.setStringAsync(extra?.simDetails?.puk ?? "????")
                }
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                  PUK: {extra?.simDetails?.puk ?? "????"}
                </Text>
                <SvgCopy stroke={Color.BLACK} />
              </RectButton>
            </View>
            <Button
              style={{ alignSelf: "stretch", marginVertical: Spacing.SMALL }}
              onPress={closeCurrent}
            >
              OK
            </Button>
          </BottomSheet>}

        {/*<MenuItemLink
          href={`/logged-in/subscriptions/${subscription.id}/settings/sim`}
          comingSoon
          notButton
        >
          Block SIM
        </MenuItemLink>

         <MenuItemLink
          href={`/logged-in/subscriptions/${subscription.id}/settings/sim`}
          comingSoon
          notButton
        >
          Reinstall eSIM
        </MenuItemLink>

        <MenuItemLink
          href={`/logged-in/subscriptions/${subscription.id}/settings/sim`}
          comingSoon
          notButton
        >
          Protect number
        </MenuItemLink>

        <MenuItemLink
          notButton
          href="/logged-in/settings/account"
          comingSoon
          style={{ marginTop: Spacing.LARGE }}
        >
          Help
        </MenuItemLink> */}
      </View>
    </SafeView>
  );
}

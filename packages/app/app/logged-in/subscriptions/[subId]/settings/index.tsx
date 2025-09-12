import { Redirect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { View } from "react-native";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { Color, Spacing } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useMe } from "@/providers/MeProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import SubscriptionDetails from "@/components/SubscriptionDetails";
import MenuItemLink from "@/components/MenuItemLink";
import Text, { TextVariant } from "@/components/Text";
import MenuItemButton from "@/components/MenuItemButton";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import BottomSheet from "@/components/BottomSheet";
import AccordionBlock from "@/components/AccordionBlock";

export default function SubscriptionsSettings() {
  const { meApi } = useApi();
  const { me } = useMe();
  const { refresh } = useSubscriptions();
  const { showError } = useErrorSheet();
  const { subId } = useLocalSearchParams<{ subId: string }>();
  const [show, setShow] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const { subscription } = useSubscriptions(subId);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    setNewLabel(subscription?.label ?? `${me.firstName} ${me.lastName}`);
  }, [subscription]);

  const handleSaveLabel = useCallback(async () => {
    try {
      await meApi.meUpdateMySubscriptionV1({
        subId,
        updateMySubscriptionDto: { label: newLabel },
      });
      await refresh();
      setShow(false);
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, subId, newLabel]);

  if (!subscription) {
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <SafeView dark>
      <Header showBack />
      <SubscriptionDetails sub={subscription} />
      <Text
        variant={TextVariant.H4}
        color={Color.WHITE}
        style={{ marginTop: Spacing.MEDIUM }}
      >
        Plan settings.
      </Text>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: Spacing.SMALL,
        }}
      >
        <BottomSheet
          trigger={(show) => (
            <MenuItemButton notButton onPress={show}>
              Edit label
            </MenuItemButton>
          )}
        >
          {(close) => (
            <>
              <Text variant={TextVariant.H3} color={Color.BLACK}>
                Edit label.
              </Text>

              <Text color={Color.BLACK}>Personalise the name of this plan.</Text>

              <TextInput
                variant="secondary_dark"
                placeholder="Label"
                placeholderTextColor={Color.GRAY}
                containerStyle={{ alignSelf: "stretch" }}
                value={newLabel}
                onChangeText={setNewLabel}
              />

              <Button style={{ alignSelf: "stretch" }} onPress={()=>{handleSaveLabel(); close()}}>
                Confirm
              </Button>
            </>
          )}
         
        </BottomSheet>
       
        <MenuItemLink
          notButton
          href={`/logged-in/subscriptions/${subId}/settings/plan`}
        >
          Manage plan
        </MenuItemLink>

        <MenuItemLink
          notButton
          href={`/logged-in/subscriptions/${subId}/settings/sim`}
        >
          Manage SIM
        </MenuItemLink>

        <MenuItemLink
          notButton
          href={`/logged-in/subscriptions/${subId}/settings`}
          comingSoon
        >
          E911 Address
        </MenuItemLink>

        <MenuItemLink
          notButton
          href={`/logged-in/subscriptions/${subId}/settings`}
          comingSoon
        >
          Bring your number
        </MenuItemLink>

        <BottomSheet
          trigger={(show) => (
            <MenuItemButton notButton onPress={show}>
              Fact Sheet
            </MenuItemButton>
          )}
        >
          <Text variant={TextVariant.H3} color={Color.BLACK}>
            {`${subscription?.offer.plan?.content?.title} Plan`}
          </Text>

          <View
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: "100%",
              //gap:Spacing.SMALL,
            }}
          >
            {subscription.offer.plan.content.details?.map((item, index) =>
              item.type === "list" || item.type === "text" ? (
                <AccordionBlock
                  key={index}
                  data={{
                    title: item.title ?? "",
                    description:
                      item.type === "list" ? item.items.join("\n") : item.text,
                  }}
                  show={openIndex === index}
                  onShow={() => setOpenIndex(index)}
                  onClose={() => setOpenIndex(null)}
                  variant={Color.BLACK}
                />
              ) : null
            )}
          </View>
        </BottomSheet>

        <MenuItemLink
          notButton
          href={`/logged-in/subscriptions/${subId}/settings`}
          comingSoon
          style={{ marginTop: Spacing.LARGE }}
        >
          Help
        </MenuItemLink>
      </ScrollView>
    </SafeView>
  );
}

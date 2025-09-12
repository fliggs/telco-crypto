import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Dimensions, View } from "react-native";
import { SubscriptionStatus } from "api-client-ts";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useTranslation } from "@/node_modules/react-i18next";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { Color, Spacing, TAB_HEIGHT } from "@/constants";
import SubscriptionDetails from "@/components/SubscriptionDetails";
import SafeView from "@/components/SafeView";
import Text from "@/components/Text";
import Button from "@/components/Button";

export default function Plans() {
  const { t } = useTranslation();
  const { subscriptions, refresh } = useSubscriptions();
  const [refreshing, setRefreshing] = useState(false);
  const { showError } = useErrorSheet();
  const { push } = useRouter();

  const ref = React.useRef<ICarouselInstance>(null);
  const progress = useSharedValue<number>(0);

  const width = Dimensions.get("window").width;

  const onPressPagination = useCallback((index: number) => {
    ref.current?.scrollTo({
      /**
       * Calculate the difference between the current index and the target index
       * to ensure that the carousel scrolls to the nearest index
       */
      count: index - progress.value,
      animated: true,
    });
  }, []);

  const subs = useMemo(
    () => subscriptions.filter((s) => s.parentId === null),
    [subscriptions]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh(true);
    } catch (err) {
      showError({
        error: err,
      });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!subs.some((s) => s.status === SubscriptionStatus.Active)) {
      const interval = setInterval(refresh, 10000);
      return () => clearInterval(interval);
    }
  }, [subs]);

  return (
    <SafeView noPaddingBottom dark>
      {subs.length === 0 && (
        <Button onPress={() => push("/logged-in/orders/add-plan")}>
          {t("home.add-plan")}
        </Button>
      )}
      <View style={{ flexGrow: 1, marginHorizontal: -Spacing.MEDIUM }}>
        <Pagination.Basic
          progress={progress}
          data={subs}
          dotStyle={{ backgroundColor: Color.GRAY }}
          activeDotStyle={{ backgroundColor: Color.PRIMARY }}
          containerStyle={{
            gap: Spacing.SMALL,
            marginTop: Spacing.SMALL,
          }}
          onPress={onPressPagination}
        />

        <Carousel
          ref={ref}
          width={width}
          data={subs}
          loop={false}
          mode="parallax"
          modeConfig={{
            parallaxAdjacentItemScale: 1,
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: Spacing.LARGE,
          }}
          onConfigurePanGesture={(gestureChain) => {
            gestureChain.activeOffsetX([-10, 10]); // this fixes issues when trying to scroll vertically on android
          }}
          vertical={false}
          onProgressChange={progress}
          renderItem={({ item }) => (
            <ScrollView
              key={item.id}
              style={{ paddingHorizontal: Spacing.MEDIUM }}
              contentContainerStyle={{
                paddingBottom: TAB_HEIGHT, // We have to add back the bottom bar height inside the carousel because it seems to ignore it otherwise
                marginHorizontal: Spacing.SMALL,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={Color.WHITE}
                />
              }
            >
              <SubscriptionDetails sub={item} showOptions showDetails />

              <Text
                color={Color.WHITE}
                style={{
                  marginTop: Spacing.LARGE,
                  marginBottom: Spacing.MEDIUM,
                }}
              >
                {t("home.add-plan-msg")}
              </Text>

              <Button onPress={() => push("/logged-in/orders/add-plan")}>
                {t("home.add-plan")}
              </Button>
            </ScrollView>
          )}
        />
      </View>
    </SafeView>
  );
}

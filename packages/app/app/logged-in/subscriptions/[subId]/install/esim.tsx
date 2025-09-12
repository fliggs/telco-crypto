import { Redirect, router, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import SimCardsManagerModule from "react-native-sim-cards-manager";
import { Linking, Platform, View } from "react-native";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { logError } from "@/util";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import { useSupport } from "@/providers/SupportProvider";
import Button, { ButtonType } from "@/components/Button";
import SelectableCard, { CardVariant } from "@/components/SelectableCard";

export default function SubscriptionsInstallESim() {
  const { subId } = useLocalSearchParams<{ subId: string }>();
  const { subscription, extra, refresh } = useSubscriptions(subId);
  const { showError } = useErrorSheet();
  const { push } = useRouter();
  const { showChat } = useSupport();
  const [selectedOption, setSelectedOption] = useState<
    "this-phone" | "another-phone" | ""
  >("");

  const handleContinue = () => {
    if (selectedOption === "this-phone") {
      handleOnThisDevice();
    } else if (selectedOption === "another-phone") {
      router.push(`/logged-in/subscriptions/${subId}/install/other-device`);
    }
  };

  useEffect(() => {
    if (!extra?.simDetails) {
      refresh(true);
    }
  }, [refresh, extra?.simDetails]);

  const handleOnThisDevice = useCallback(async () => {
    const details = extra?.simDetails;

    if (!details) {
      logError(new Error("missing_sim_details"));
      showError({
        error: "Missing SIM details",
      });
      return;
    }

    if (!details?.eSimActivationCode) {
      logError(new Error("Missing SIM activation code"));
      showError({
        error: "Missing SIM activation code",
      });
      return;
    }

    try {
      const isSupported = await SimCardsManagerModule.isEsimSupported();

      const localSims = await SimCardsManagerModule.getSimCards({
        title: "App Permission",
        message: "Custom message",
        buttonNeutral: "Not now",
        buttonNegative: "Not OK",
        buttonPositive: "OK",
      });

      const [, smdpAddress, matchingId] = details.eSimActivationCode.split("$");

      const isSetup = await SimCardsManagerModule.setupEsim({
        matchingId: matchingId,
        address: smdpAddress,
      });
    } catch (err) {
      logError(err);

      const code = details.eSimActivationCode;

      if (Platform.OS === "ios" && Number(Platform.Version) >= 17) {
        Linking.openURL(
          `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=LPA:${code}`
        );
      } else {
        router.navigate(
          `/logged-in/subscriptions/${subId}/install/this-device`
        );
      }
    }
  }, [subscription, extra?.simDetails]);

  if (!subscription) {
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            gap: Spacing.SMALL,
          }}
        >
          <Text variant={TextVariant.H3} color={Color.WHITE}>
            Install your eSIM.
          </Text>

          <Text
            variant={TextVariant.BodyLarge}
            color={Color.WHITE}
            style={{
              marginBottom: Spacing.SMALL,
            }}
          >
            On which phone would you like to install the eSIM?
          </Text>
          <View style={{ gap: Spacing.SMALL }}>
            <SelectableCard
              title="On this phone"
              variant={CardVariant.SECONDARY}
              selected={selectedOption === "this-phone"}
              onPress={() => setSelectedOption("this-phone")}
            />
            <SelectableCard
              title="On another phone"
              variant={CardVariant.SECONDARY}
              selected={selectedOption === "another-phone"}
              onPress={() => setSelectedOption("another-phone")}
            />
          </View>
        </View>
        <View>
          <Button
            onPress={showChat}
            type={ButtonType.TRANSPARENT}
            style={{
              padding: Spacing.MEDIUM,
              borderColor: Color.WHITE,
              borderWidth: 1,
            }}
          >
            Chat with us
          </Button>
          <Button onPress={handleContinue} style={{ marginTop: Spacing.SMALL }}>
            Continue
          </Button>
        </View>
      </View>
    </SafeView>
  );
}

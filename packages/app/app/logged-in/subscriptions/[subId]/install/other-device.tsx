import { Link, Redirect, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Dimensions, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

import { useSubscriptions } from "@/providers/SubscriptionsProvider";
import { RectButton, ScrollView } from "react-native-gesture-handler";
import { useBottomSheet } from "@/providers/BottomSheetProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import SubscriptionDetails from "@/components/SubscriptionDetails";
import Text, { TextVariant } from "@/components/Text";
import Button, { ButtonType } from "@/components/Button";

import SvgCopy from "@/assets/icons/copy.svg";
import BottomSheet from "@/components/BottomSheet";
import { useSupport } from "@/providers/SupportProvider";

export default function SubscriptionsInstall() {
  const { setCurrent: show, closeCurrent: close } = useBottomSheet();
  const { showError } = useErrorSheet();
  const { subId } = useLocalSearchParams<{ subId: string }>();
  const { subscription, extra } = useSubscriptions(subId);

  const details = useMemo(() => extra?.simDetails, [extra?.simDetails]);
  const code = useMemo(() => details?.eSimActivationCode, [details]);
  const codeSplits = useMemo(() => code?.split("$") ?? [], [code]);
  const { showChat } = useSupport();

  if (!subscription || !details) {
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Scan QR code.
      </Text>

      <ScrollView
        contentContainerStyle={{
          display: "flex",
          flexDirection: "column",
          gap: Spacing.LARGE,
        }}
      >
        <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
          Open the camera on the phone where you want the eSIM, then scan the QR
          code below.
        </Text>

        {code && (
          <View style={{ alignSelf: "center", marginTop: Spacing.MEDIUM }}>
            <QRCode value={code} size={Dimensions.get("window").width / 1.75} />
          </View>
        )}
      </ScrollView>

      <BottomSheet
        imageSuccess
        trigger={(show) => (
          <RectButton
            onPress={() =>
              code
                ? show()
                : showError({ error: "Missing SIM activation code" })
            }
          >
            <Text variant={TextVariant.Link}>Manual Setup {">"}</Text>
          </RectButton>
        )}
      >
        <View>
          <Text color={Color.BLACK}>Status:</Text>
          <Text color={Color.BLACK}>{details.eSimStatus}</Text>
        </View>

        <RectButton
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.MEDIUM,
          }}
          onPress={() => Clipboard.setStringAsync(codeSplits[1])}
        >
          <View style={{ flex: 1 }}>
            <Text color={Color.BLACK}>SM-DP+ address:</Text>
            <Text color={Color.BLACK}>{codeSplits[1]}</Text>
          </View>
          <SvgCopy stroke={Color.BLACK} />
        </RectButton>

        <RectButton
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: Spacing.MEDIUM,
          }}
          onPress={() => Clipboard.setStringAsync(codeSplits[2])}
        >
          <View style={{ flex: 1 }}>
            <Text color={Color.BLACK}>Activation code:</Text>
            <Text color={Color.BLACK}>{codeSplits[2]}</Text>
          </View>
          <SvgCopy stroke={Color.BLACK} />
        </RectButton>

        <Button
          style={{ alignSelf: "stretch", marginTop: Spacing.SMALL }}
          onPress={close}
        >
          OK
        </Button>
      </BottomSheet>
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
        <Button style={{ marginTop: Spacing.SMALL }}>Continue</Button>
      </View>
    </SafeView>
  );
}

import { Redirect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { Dimensions, Share, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import QRCode from "react-native-qrcode-svg";

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
  const qr = useRef<{ toDataURL: (cb: (data: string) => void) => void }>(null);
  const { showChat } = useSupport();

  const details = useMemo(() => extra?.simDetails, [extra?.simDetails]);
  const code = useMemo(() => details?.eSimActivationCode, [details]);
  const codeSplits = useMemo(() => code?.split("$") ?? [], [code]);

  const handleShareQr = useCallback(() => {
    qr.current?.toDataURL((data) =>
      Share.share(
        { url: `data:image/png;base64,${data}` },
        { dialogTitle: "Share QR code" }
      )
    );
  }, []);

  if (!subscription || !details) {
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
        <ScrollView
          contentContainerStyle={{
            gap: Spacing.SMALL,
          }}
        >
          <Text variant={TextVariant.H3} color={Color.WHITE}>
            Share QR code.
          </Text>

          <Text
            variant={TextVariant.BodyLarge}
            color={Color.WHITE}
            style={{ marginBottom: Spacing.MEDIUM }}
          >
            Please tap 'SHARE QR' to display the QR code on another device, then
            scan it with this phone's camera.
          </Text>

          {code && (
            <View style={{ alignSelf: "center", marginTop: Spacing.LARGE }}>
              <QRCode
                getRef={(r) => (qr.current = r)}
                value={code}
                size={Dimensions.get("window").width / 1.75}
              />
            </View>
          )}
        </ScrollView>
        <View>
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
                <Text
                  variant={TextVariant.Link}
                  style={{ marginBottom: Spacing.MEDIUM }}
                >
                  Manual Setup {">"}
                </Text>
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
          <Button
            style={{ alignSelf: "stretch", marginTop: Spacing.SMALL }}
            onPress={handleShareQr}
          >
            Share QR
          </Button>
        </View>
      </View>
    </SafeView>
  );
}

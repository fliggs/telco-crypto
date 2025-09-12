import { useCallback, useState } from "react";
import { Pressable } from "react-native-gesture-handler";
import { View } from "react-native";
import {
  BarcodeScanningResult,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { Color, Spacing } from "@/constants";

import Text, { TextVariant } from "./Text";
import Button from "./Button";
import TextInput from "./TextInput";

interface Props {
  onContinue: (iccid: string) => void;
}

export default function SimCardScanScreen({ onContinue }: Props) {
  const [iccid, setIccid] = useState("");

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();

  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }, []);

  const onBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      const url = new URL(result.data);
      const iccid = url.searchParams.get("iccid");
      if (iccid) {
        setIccid(iccid);
      }
    },
    []
  );

  return (
    <>
      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Scan your SIM{"\n"}qr code.
      </Text>

      {!permission?.granted ? (
        <View
          style={{ flex: 1, justifyContent: "flex-end", gap: Spacing.MEDIUM }}
        >
          <Text>We need your permission to show the camera</Text>
          <Button onPress={requestPermission}>grant permission</Button>
        </View>
      ) : (
        <>
          <CameraView
            style={{ flex: 1 }}
            facing={facing}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={onBarcodeScanned}
            autofocus="on"
            mute
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                backgroundColor: "transparent",
                margin: 64,
              }}
            >
              <Pressable
                style={{
                  flex: 1,
                  alignSelf: "flex-end",
                  alignItems: "center",
                }}
                onPress={toggleCameraFacing}
              >
                <Text>Flip Camera</Text>
              </Pressable>
            </View>
          </CameraView>

          <TextInput
            variant="secondary"
            placeholder="Enter SIM ICCID"
            value={iccid}
            onChangeText={setIccid}
          />

          <Button
            onPress={() => onContinue(iccid)}
            enabled={iccid.length >= 19 && iccid.length <= 20}
          >
            Continue
          </Button>
        </>
      )}
    </>
  );
}

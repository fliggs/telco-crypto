import { useCallback, useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";

import { useApi } from "@/providers/ApiProvider";
import { Color, Spacing } from "@/constants";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import TextInput from "@/components/TextInput";
import Button from "@/components/Button";
import CustomCheckbox from "@/components/CustomCheckBox";
import ScanQr from "@/assets/icons/scan-qr.svg";
import QRCodeScanner from "@/components/QrCodeScanner";

export default function WalletSetupImport() {
  const { meApi } = useApi();
  const [address, setAddress] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showScan, setShowScan] = useState(false);

  const onContinue = useCallback(async () => {
    router.push({
      pathname: "/logged-in/wallet/setup/import/seed",
      params: { address: address },
    });
  }, [meApi, address]);

  const handleScanned = (scannedData: string) => {
    setShowScan(false);
    setAddress(scannedData);
  };

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Import a wallet
      </Text>
      {showScan ? (
        <View>
          <Text
            color={Color.WHITE}
            style={{ marginBottom: Spacing.SMALL }}
            variant={TextVariant.BodyLarge}
          >
            Capture the receiving address.
          </Text>

          <QRCodeScanner onScanned={handleScanned} />
        </View>
      ) : (
        <>
          <View style={{ marginTop: Spacing.SMALL }}>
            <Text
              color={Color.WHITE}
              style={{ marginBottom: Spacing.SMALL }}
              variant={TextVariant.BodyLarge}
            >
              You can connect your existing Solana wallet to the app. Make sure
              your wallet supports receiving BTC (wBTC), SOL, and USDC on the
              Solana network.
            </Text>
            <TextInput
              variant="secondary"
              placeholder="Enter your address"
              value={address}
              onChangeText={setAddress}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              rightIcon={<ScanQr />}
              onRightIconPress={() => setShowScan(true)}
            />
          </View>

          <View style={{ flexGrow: 1 }} />

          <View style={{ marginVertical: Spacing.LARGE }}>
            <CustomCheckbox
              text="I confirm that the wallet address is correct and understand that if an incorrect address is entered, any funds sent will be unrecoverable."
              checked={accepted}
              onCheckedChange={setAccepted}
            />
          </View>

          <Button
            onPress={onContinue}
            enabled={address.length >= 32 && accepted}
          >
            Continue
          </Button>
        </>
      )}
    </SafeView>
  );
}

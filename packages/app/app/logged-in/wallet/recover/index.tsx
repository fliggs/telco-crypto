import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";

import Button from "@/components/Button";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import SelectableCard, { CardVariant } from "@/components/SelectableCard";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";

export default function WalletRecover() {
  const { address } = useLocalSearchParams<{ address: string }>();
  const [mode, setMode] = useState<"local" | "cloud">();

  const onContinue = useCallback(() => {
    if (mode === "cloud") {
      router.push({
        pathname: "/logged-in/wallet/recover/cloud",
        params: { address },
      });
    } else if (mode === "local") {
      router.push({
        pathname: "/logged-in/wallet/recover/local",
        params: { address },
      });
    }
  }, [address, mode]);

  return (
    <SafeView dark>
      <Header />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Welcome back
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        It looks like you're using the app on a new phone. To access your wallet
        on this device, please restore the wallet using your preferred recovery
        method.
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        Select a recovery option to continue.
      </Text>

      <View style={{ gap: Spacing.SMALL }}>
        <SelectableCard
          title="Cloud backup"
          description="Enter your cloud backup password and you are ready to go."
          variant={CardVariant.SECONDARY}
          selected={mode === "cloud"}
          onPress={() => setMode("cloud")}
        />
        <SelectableCard
          title="Seed phrase"
          description="Enter your 12-word phrase to regain access your wallet."
          variant={CardVariant.SECONDARY}
          selected={mode === "local"}
          onPress={() => setMode("local")}
        />
      </View>

      <View style={{ flexGrow: 1 }} />

      <Button onPress={onContinue} enabled={!!mode}>
        Continue
      </Button>
    </SafeView>
  );
}

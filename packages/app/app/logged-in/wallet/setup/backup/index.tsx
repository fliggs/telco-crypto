import { useCallback, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import SelectableCard, { CardVariant } from "@/components/SelectableCard";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";
import Button from "@/components/Button";

export default function WalletSetupSecurity() {
  const [backup, setBackup] = useState<"cloud" | "local" | "both">("both");

  const onContinue = useCallback(() => {
    if (backup === "both" || backup === "cloud") {
      router.push({
        pathname: "/logged-in/wallet/setup/backup/cloud",
        params: { both: backup === "both" ? "true" : "false" },
      });
    } else if (backup === "local") {
      router.push({
        pathname: "/logged-in/wallet/setup/backup/local",
        params: { canSkip: "false" },
      });
    }
  }, [backup]);

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Set up wallet security.
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        If you ever lose your phone or get a new one, you’ll need to recover
        your wallet. Please select your preferred back-up and recovery method.
      </Text>

      <View style={{ gap: Spacing.SMALL, marginBottom:Spacing.MEDIUM }}>
        <SelectableCard
          title="Cloud backup"
          description="Your wallet is backed up in iCloud and can be recovered with a password."
          variant={CardVariant.SECONDARY}
          selected={backup === "cloud"}
          onPress={() => setBackup("cloud")}
        />
        <SelectableCard
          title="Seed Phrase"
          description="A 12-word key to your wallet. Write it down and keep it safe."
          variant={CardVariant.SECONDARY}
          selected={backup === "local"}
          onPress={() => setBackup("local")}
        />
      </View>

      <Text color={Color.WHITE} variant={TextVariant.BodyLarge}>
        Recommended:
      </Text>
      <SelectableCard
        title="Both"
        description="The highest level of security to keep your assets safe at all times. "
        variant={CardVariant.SECONDARY}
        selected={backup === "both"}
        onPress={() => setBackup("both")}
      />

      <View style={{ flexGrow: 1 }} />

      <Button onPress={onContinue}>Continue</Button>
    </SafeView>
  );
}

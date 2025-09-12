import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import Button, { ButtonType } from "@/components/Button";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";
import { useWallet } from "@/providers/WalletProvider";
import CustomCheckbox from "@/components/CustomCheckBox";

export default function WalletSetupLocal() {
  const { wallet } = useWallet();
  const { canSkip } = useLocalSearchParams();
  const [accepted, setAccepted] = useState(false);

  const words = useMemo(() => wallet?.seed?.split(" ") ?? [], [wallet?.seed]);

  const onSkip = useCallback(() => {
    router.navigate("/logged-in/main/wallets");
  }, []);

  const onContinue = useCallback(() => {
    router.push("/logged-in/wallet/setup/backup/local-check");
  }, []);

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Write down your seed phrase.
      </Text>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          color={Color.WHITE}
          style={{ marginBottom: Spacing.SMALL }}
          variant={TextVariant.BodyLarge}
        >
          Write down your 12-word seed phrase and keep it in a safe place. It’s
          the only way to recover your wallet if you ever lose access to your
          cloud backup.
        </Text>

        <Text
          color={Color.WHITE}
          style={{ marginBottom: Spacing.SMALL }}
          variant={TextVariant.BodyLarge}
        >
          In the next step, you’ll need to enter the phrase in the correct
          order to confirm.
        </Text>

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: Spacing.MEDIUM,
            marginTop: Spacing.MEDIUM,
          }}
        >
          {words.map((word, i) => (
            <View
              key={i}
              style={{
                alignItems: "center",
                flexDirection: "row",
                gap: Spacing.SMALL,
                width: "33.33333333%",
                paddingHorizontal: Spacing.SMALL,
              }}
            >
              <Text color={Color.WHITE} style={{ width: 24 }}>
                {i + 1}.
              </Text>
              <Text
                variant={TextVariant.Fineprint}
                color={Color.WHITE}
                style={{
                  flexGrow: 1,
                  padding: Spacing.SMALL,
                  backgroundColor: Color.PETROL,
                  borderRadius: 100,
                  textAlign: "center",
                }}
              >
                {word}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ marginVertical: Spacing.LARGE }}>
          <CustomCheckbox
            text="I confirm that I’ve written down my seed phrase in the correct order and will store it securely."
            checked={accepted}
            onCheckedChange={setAccepted}
          />
        </View>

        <View style={{ flexGrow: 1 }} />

        {canSkip === "true" && (
          <Button
            type={ButtonType.TRANSPARENT_BORD}
            onPress={onSkip}
            style={{ marginVertical: Spacing.SMALL }}
          >
            Skip
          </Button>
        )}

        <Button onPress={onContinue} enabled={accepted}>
          Continue
        </Button>
      </ScrollView>
    </SafeView>
  );
}

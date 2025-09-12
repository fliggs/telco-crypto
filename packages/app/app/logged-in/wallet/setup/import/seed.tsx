import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { WalletProvider } from "api-client-ts";

import { clampArray } from "@/util";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useApi } from "@/providers/ApiProvider";
import { Color, Spacing } from "@/constants";
import { useWallet } from "@/providers/WalletProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import TextInput from "@/components/TextInput";
import Button, { ButtonType } from "@/components/Button";
import LoadingComponent from "@/components/LoadingComponent";

export default function WalletSetupImportSeed() {
  const { address } = useLocalSearchParams();
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const { store } = useWallet();
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState("");
  const words = useMemo(
    () => clampArray(text.toLocaleLowerCase().split(" "), 24),
    [text]
  );

  const onSkip = useCallback(async () => {
    if (typeof address !== "string") {
      return;
    }

    setLoading(true);
    try {
      await store({
        address,
        seed: null,
      });
      await meApi.meCreateMyWalletV1({
        createMyWalletDto: {
          provider: WalletProvider.Solana,
          address: address,
          imported: true,
          readOnly: true,
        },
      });
      router.navigate("/logged-in/main/wallets");
    } catch (err) {
      showError({ error: err });
    } finally {
      setLoading(false);
    }
  }, [address]);

  const onContinue = useCallback(async () => {
    if (typeof address !== "string") {
      return;
    }

    const seed = words.join(" ");

    setLoading(true);
    try {
      await store({
        address,
        seed: seed,
      });
      await meApi.meCreateMyWalletV1({
        createMyWalletDto: {
          provider: WalletProvider.Solana,
          address: address,
          imported: true,
          readOnly: false,
        },
      });
      await meApi.meUpdateMyWalletV1({
        walletIdOrAddress: address,
        updateMyWalletDto: {
          localBackup: true,
        },
      });
      router.navigate("/logged-in/main/wallets");
    } catch (err) {
      showError({ error: err });
    } finally {
      setLoading(false);
    }
  }, [meApi, address, words]);

  if (loading) {
    return <LoadingComponent processing />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Enter your seed phrase.
      </Text>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 , gap:Spacing.SMALL}}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          color={Color.WHITE}
          style={{ marginBottom: Spacing.SMALL }}
          variant={TextVariant.BodyLarge}
        >
          To access your full wallet, enter your 12- or 24-word seed phrase. Tap
          ‘READ ONLY’ to connect your wallet in read-only mode.
        </Text>

        <TextInput
          variant="secondary"
          placeholder="Enter your seedphrase"
          value={text}
          onChangeText={setText}
          keyboardType="default"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: Spacing.MEDIUM,
            overflow: "hidden",
            marginVertical:Spacing.MEDIUM
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
                  borderWidth: 2,
                  borderStyle: !word ? "dashed" : undefined,
                  borderColor: Color.PETROL,
                  backgroundColor: !word ? undefined : Color.PETROL,
                  borderRadius: 100,
                  textAlign: "center",
                }}
              >
                {word}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flexGrow: 1 }} />

        <Button type={ButtonType.TRANSPARENT_BORD} onPress={onSkip}>
          Read only
        </Button>
        <Button onPress={onContinue} enabled={words.every((w) => !!w)}>
          Continue
        </Button>
      </ScrollView>
    </SafeView>
  );
}

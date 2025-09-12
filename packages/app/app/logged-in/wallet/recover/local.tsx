import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { View } from "react-native";

import { Color, Spacing } from "@/constants";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useWallet } from "@/providers/WalletProvider";
import { clampArray } from "@/util";
import Button from "@/components/Button";
import Header from "@/components/Header";
import LoadingComponent from "@/components/LoadingComponent";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import TextInput from "@/components/TextInput";
import { useApi } from "@/providers/ApiProvider";

export default function WalletRecoverLocal() {
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const { create, store } = useWallet();
  const { address } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const words = useMemo(
    () => clampArray(text.toLocaleLowerCase().split(" "), 12),
    [text]
  );

  const onContinue = useCallback(async () => {
    setLoading(true);
    try {
      const wallet = await create(words.join(" "));
      if (wallet.address !== address) {
        throw new Error("wallet_address_mismatch");
      }

      const wallets = await meApi.meFindMyWalletsV1();
      const remoteWallet = wallets.find((w) => w.address === wallet.address);
      if (!remoteWallet) {
        throw new Error("wallet_not_previously_linked");
      }

      await store({
        ...wallet,
        localBackupAt: remoteWallet.localBackupAt,
        cloudBackupAt: remoteWallet.cloudBackupAt,
      });
      router.navigate("/logged-in/main/wallets");
    } catch (err) {
      showError({ error: err });
    } finally {
      setLoading(false);
    }
  }, [address, words]);

  if (loading) {
    return <LoadingComponent processing />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Enter your seed phrase.
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        Please enter your 12-word seed phrase to to recover your wallet.
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

      <Button onPress={onContinue} enabled={words.every((w) => !!w)}>
        Continue
      </Button>
    </SafeView>
  );
}

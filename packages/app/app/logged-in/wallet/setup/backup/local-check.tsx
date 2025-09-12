import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import Button from "@/components/Button";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";
import { useWallet } from "@/providers/WalletProvider";
import { clampArray, shuffle } from "@/util";
import { useApi } from "@/providers/ApiProvider";
import BottomSheet from "@/components/BottomSheet";
import Warning from "@/components/Warning";
import { t } from "i18next";

export default function WalletSetupLocal() {
  const { meApi } = useApi();
  const { wallet, update } = useWallet();
  const { canSkip } = useLocalSearchParams();
  const showSheetRef = useRef(null);
  const didAttemptRef = useRef(false);

  const words = useMemo(() => wallet?.seed?.split(" ") ?? [], [wallet?.seed]);

  const [missingWords, setMissingWords] = useState<string[]>([]);
  const [placedWords, setPlacedWords] = useState<string[]>([]);

  useEffect(() => {
    setMissingWords(shuffle(words));
    setPlacedWords([]);
  }, [words]);
  const allPlaced = placedWords.length === words.length && !placedWords.includes(undefined);

  useEffect(() => {
    if (!didAttemptRef.current) {
      didAttemptRef.current = true;
      return;
    }
    if (missingWords.length === 0 && placedWords.join(" ") !== wallet?.seed) {
      showSheetRef.current?.();
    }
  }, [missingWords, placedWords, wallet]);
  const onContinue = useCallback(async () => {
    if (!wallet) {
      return;
    }

    await meApi.meUpdateMyWalletV1({
      walletIdOrAddress: wallet.address,
      updateMyWalletDto: {
        localBackup: true,
      },
    });
    update({ local: true });

    router.navigate("/logged-in/main/wallets");
  }, [wallet, canSkip]);

  const onAdd = useCallback((word: string, idx: number) => {
    setMissingWords((words) => words.filter((_, i) => i !== idx));
    setPlacedWords((words) => {
      const idx = words.findIndex((w) => !w);
      if (idx < 0) {
        return words;
      }
      return [...words.slice(0, idx), word, ...words.slice(idx + 1)];
    });
  }, []);

  const onRemove = useCallback((word: string, idx: number) => {
    setMissingWords((words) => words.concat(word));
    setPlacedWords((words) => words.filter((_, i) => i !== idx));
  }, []);

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Confirm your seed phrase.
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        To confirm you’ve recorded your seed phrase correctly, please tap each
        word in the order it was originally shown.
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          rowGap: Spacing.SMALL,
        }}
      >
        {clampArray(placedWords, 12).map((word, i) => (
          <Pressable
            key={i}
            onPress={() => onRemove(word, i)}
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
          </Pressable>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          rowGap: Spacing.MEDIUM,
        }}
      >
        {missingWords.map((word, i) => (
          <Pressable
            key={i}
            onPress={() => onAdd(word, i)}
            style={{
              alignItems: "center",
              flexDirection: "row",
              gap: Spacing.SMALL,
              width: "33.33333333%",
              paddingHorizontal: Spacing.SMALL,
            }}
          >
            <Text
              color={Color.WHITE}
              variant={TextVariant.Fineprint}
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
          </Pressable>
        ))}
      </View>


      <BottomSheet
        trigger={(show) => {
          showSheetRef.current = show;
          return null;
        }}
        onClose={() => {
          setMissingWords(shuffle(words));
          setPlacedWords(new Array(words.length).fill(""));
        }}

      >
        {(close) => (
          <>
            <Warning color={Color.RED} />
            <Text variant={TextVariant.H4} color={Color.BLACK} style={{ textAlign: "left", width: "90%" }}>
              {t("onboarding.we-are-sorry")}
            </Text>
            <Text variant={TextVariant.BodyMedium} color={Color.BLACK} style={{ textAlign: "left", width: "90%" }}>
              {t("wallets.invalid-seed")}
            </Text>

            <Button
              style={{
                marginTop: Spacing.SMALL,
                width: "95%",
                marginBottom: Spacing.SMALL,
              }}
              onPress={() => {
                setMissingWords(shuffle(words));
                setPlacedWords(new Array(words.length).fill(""));
                close();
              }}

            >
              {t("wallets.try-again")}
            </Button>
          </>
        )}
      </BottomSheet>
      <View style={{ flexGrow: 1 }} />

      <Button
        onPress={onContinue}
        enabled={placedWords.join(" ") === wallet?.seed}
      >
        Continue
      </Button>
    </SafeView>
  );
}

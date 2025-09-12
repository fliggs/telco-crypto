import { useCallback, useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { WalletProvider } from "api-client-ts";
import { RectButton } from "react-native-gesture-handler";
import { t } from "i18next";

import { useWallet } from "@/providers/WalletProvider";
import { Color, Spacing } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import SelectableCard, { CardVariant } from "@/components/SelectableCard";
import Text, { TextVariant } from "@/components/Text";
import Button from "@/components/Button";
import LoadingComponent from "@/components/LoadingComponent";
import BottomSheet from "@/components/BottomSheet";

export default function WalletSetup() {
  const { meApi } = useApi();
  const [mode, setMode] = useState<"create" | "import">("create");
  const { create, store } = useWallet();
  const [loading, setLoading] = useState(false);
  const { showError } = useErrorSheet();

  const onContinue = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === "create") {
        const wallet = await create();
        await store(wallet);
        await meApi.meCreateMyWalletV1({
          createMyWalletDto: {
            provider: WalletProvider.Solana,
            address: wallet.address,
            imported: false,
            readOnly: false,
          },
        });
        setLoading(false);
        router.push("/logged-in/wallet/setup/backup");
      } else if (mode === "import") {
        setLoading(false);
        router.push("/logged-in/wallet/setup/import");
      }
    } catch (err) {
      setLoading(false);
      showError({ error: err });
    }
  }, [mode]);

  if (loading) {
    return <LoadingComponent processing />;
  }

  return (
    <SafeView dark>
      <Header />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        {t("wallets.set-up")}
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        Create a wallet or import an existing one to receive and manage your
        crypto cashbacks.
      </Text>

      <View style={{ gap: Spacing.SMALL }}>
        <SelectableCard
          title="Create a wallet"
          description="Set up and secure your wallet in just a few simple steps."
          variant={CardVariant.SECONDARY}
          selected={mode === "create"}
          onPress={() => setMode("create")}
        />
        <SelectableCard
          title="Import a wallet"
          description="Connect a Solana wallet if you already have one."
          variant={CardVariant.SECONDARY}
          selected={mode === "import"}
          onPress={() => setMode("import")}
        />
      </View>

      <View style={{ flexGrow: 1 }} />

      <BottomSheet
        trigger={(show) => (
          <RectButton onPress={show}>
            <Text color={Color.WHITE}>By continuing you accept our </Text>
            <Text variant={TextVariant.Link}>
              Wallet Terms & Conditions {">"}
            </Text>
          </RectButton>
        )}
      >
        <Text variant={TextVariant.H3} color={Color.BLACK}>
          Terms and conditions
        </Text>

        {/* {terms.map((term, i) => (
          <Text key={i} color={Color.BLACK}>
            {term}
          </Text>
        ))} */}
      </BottomSheet>

      <Button onPress={onContinue}>Start</Button>
    </SafeView>
  );
}

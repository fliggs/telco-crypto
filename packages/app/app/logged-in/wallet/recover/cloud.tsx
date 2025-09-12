import { useCallback, useEffect, useState } from "react";
import { CloudStorage, CloudStorageProvider } from "react-native-cloud-storage";
import * as ExpoGoogleAuthentication from "@heartbot/expo-google-authentication";
import { router, useLocalSearchParams } from "expo-router";
import { Platform, View } from "react-native";

import { Color, Spacing } from "@/constants";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { decrypt, logError } from "@/util";
import { useWallet, Wallet } from "@/providers/WalletProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import LoadingComponent from "@/components/LoadingComponent";
import PasswordInput from "@/components/PasswordInput";
import Button from "@/components/Button";
import { useApi } from "@/providers/ApiProvider";

// TODO: This is currently duplicated
const BACKUP_DIR = "/backups";

export default function WalletRecoverCloud() {
  const { meApi, authApi } = useApi();
  const { store } = useWallet();
  const { address } = useLocalSearchParams();
  const { showError } = useErrorSheet();
  const [loading, setLoading] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (CloudStorage.getProvider() === CloudStorageProvider.GoogleDrive) {
      const main = async () => {
        const exchange = await authApi.authGoogleExchangeStartV2({
          strategy: "user",
        });

        ExpoGoogleAuthentication.configure({
          webClientId: exchange.webClientId,
          iOSClientId: exchange.iOSClientId,
        });

        await ExpoGoogleAuthentication.login();
        const res = await ExpoGoogleAuthentication.authorize({
          scopes: ["https://www.googleapis.com/auth/drive.appdata"],
        });
        CloudStorage.setProviderOptions({ accessToken: res.accessToken });
      };
      main();
    }
  }, []);

  const onContinue = useCallback(async () => {
    setLoading(true);
    try {
      if (!(await CloudStorage.isCloudAvailable())) {
        throw new Error("cloud_not_available");
      }

      if (typeof address !== "string") {
        throw new Error("invalid_wallet_address");
      }

      await CloudStorage.triggerSync(BACKUP_DIR).catch(() => null);
      await CloudStorage.triggerSync(`${BACKUP_DIR}/${address}`).catch(
        () => null
      );

      const exists = await CloudStorage.exists(
        `${BACKUP_DIR}/${address}`
      ).catch((err) => {
        logError(err);
        return false;
      });
      if (!exists) {
        throw new Error("backup_not_found");
      }

      const res = await CloudStorage.readFile(`${BACKUP_DIR}/${address}`);

      try {
        const walletStr = await decrypt(pw, res);
        const wallet: Wallet = JSON.parse(walletStr);

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
        logError(err);
        throw new Error("incorrect_password");
      }
    } catch (err) {
      showError({ error: err });
    } finally {
      setLoading(false);
    }
  }, [address, pw]);

  if (loading) {
    return <LoadingComponent processing />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Welcome back
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        Your wallet is backed up to{" "}
        {Platform.OS === "ios"
          ? "iCloud"
          : Platform.OS === "android"
          ? "Google Cloud"
          : "a cloud"}
        . Please enter your Cloud backup password to recover your wallet.
      </Text>

      <PasswordInput
        variant="secondary"
        placeholder="Password"
        value={pw}
        onChangeText={setPw}
      />

      <View style={{ flexGrow: 1 }} />

      <Button onPress={onContinue} enabled={pw.length >= 8}>
        Continue
      </Button>
    </SafeView>
  );
}

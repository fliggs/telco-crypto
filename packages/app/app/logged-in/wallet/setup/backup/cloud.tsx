import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { CloudStorage, CloudStorageProvider } from "react-native-cloud-storage";
import { router, useLocalSearchParams } from "expo-router";
import * as ExpoGoogleAuthentication from "@heartbot/expo-google-authentication";

import { encrypt } from "@/util";
import Header from "@/components/Header";
import PasswordInput from "@/components/PasswordInput";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";
import Button from "@/components/Button";
import { useApi } from "@/providers/ApiProvider";
import { useWallet } from "@/providers/WalletProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import LoadingComponent from "@/components/LoadingComponent";
import CustomCheckbox from "@/components/CustomCheckBox";

// TODO: This is currently duplicated
const BACKUP_DIR = "/backups";

export default function WalletSetupCloud() {
  const { meApi, authApi } = useApi();
  const { both } = useLocalSearchParams();
  const { wallet, update } = useWallet();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const { showError } = useErrorSheet();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

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
    if (pw !== pw2 || !wallet) {
      return;
    }

    setLoading(true);

    try {
      if (!(await CloudStorage.isCloudAvailable())) {
        throw new Error("cloud_not_available");
      }

      await CloudStorage.mkdir(BACKUP_DIR);

      const encContent = await encrypt(pw, JSON.stringify(wallet));

      await CloudStorage.writeFile(
        `${BACKUP_DIR}/${wallet.address}`,
        JSON.stringify(encContent)
      );

      await meApi.meUpdateMyWalletV1({
        walletIdOrAddress: wallet.address,
        updateMyWalletDto: {
          cloudBackup: true,
        },
      });
      update({ cloud: true });

      if (both === "true") {
        router.push({
          pathname: "/logged-in/wallet/setup/backup/local",
          params: { canSkip: "true" },
        });
      } else {
        router.navigate("/logged-in/main/wallets");
      }
    } catch (err) {
      showError({ error: err });
    } finally {
      setLoading(false);
    }
  }, [wallet, both, pw, pw2]);

  if (loading) {
    return <LoadingComponent processing />;
  }

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Enable cloud backup.
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
        . If you lose your device or get a new one, you’ll be able to recover
        the wallet.
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        Create a password to enable and secure the backup.
      </Text>

      <PasswordInput
        variant="secondary"
        placeholder="Password"
        floatingPlaceholder="Password min. 8 characters"
        value={pw}
        onChangeText={setPw}
      />
      <PasswordInput
        variant="secondary"
        placeholder="Confirm password"
        value={pw2}
        onChangeText={setPw2}
        hideStrengthLabel
      />

      <CustomCheckbox
        text="I will keep this password safe and understand that mobile Inc. will not be able to reset or recover this password for me."
        checked={accepted}
        onCheckedChange={setAccepted}
      />

      <View style={{ flexGrow: 1 }} />

      <Button
        onPress={onContinue}
        enabled={pw.length >= 8 && pw === pw2 && accepted}
      >
        Continue
      </Button>
    </SafeView>
  );
}

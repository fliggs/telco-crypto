import React from "react";
import SafeView from "@/components/SafeView";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";
import Warning from "@/components/Warning";
import { Linking, Platform, View } from "react-native";
import Button from "@/components/Button";

const APP_STORE_URL = "https://apps.apple.com/app/idYOUR_APPLE_ID";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME";

const openStore = () => {
  const url = Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
  Linking.openURL(url).catch((err) =>
    console.error("Failed to open store:", err)
  );
};
const minAppVersion = () => {
  return (
    <SafeView dark>
      <Text
        variant={TextVariant.H3}
        color={Color.WHITE}
        style={{ marginTop: Spacing.MEDIUM }}
      >
        Welcome back.
      </Text>
      <Warning />
      <Text
        variant={TextVariant.BodyMedium}
        color={Color.WHITE}
        style={{ alignSelf: "flex-start", marginBottom: Spacing.MEDIUM }}
      >
        We’ve made some important updates to the app to keep things running
        smoothly and securely.{"\n\n"}
        Please update to the latest version to continue using the app.
      </Text>

      <View style={{ flex: 1 }} />
      <Button onPress={openStore}>Update</Button>
    </SafeView>
  );
};

export default minAppVersion;

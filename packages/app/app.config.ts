import "ts-node/register";

import { ConfigContext, ExpoConfig } from "expo/config";

import pkg from "./package.json";

const IS_PROD = process.env.APP_VARIANT === "production";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "telco-crypto",
  slug: "telco-crypto",
  version: pkg.version,
  orientation: "portrait",
  scheme: ["telco-crypto", IS_PROD ? "xxxx" : "xxxx"],
  userInterfaceStyle: "automatic",
  ios: {
    bundleIdentifier: IS_PROD ? "xxxx" : "xxxx",
    supportsTablet: true,
    usesAppleSignIn: true,
    associatedDomains: ["applinks:xxxx"],
    infoPlist: {
      "com.apple.security.network.server": true,
      "com.apple.security.network.client": true,
      "com.apple.CommCenter.fine-grained": [
        "spi",
        "sim-authentication",
        "identity",
      ],
      "com.apple.wlan.authentication": true,
      "keychain-access-groups": [
        "apple",
        "com.apple.identities",
        "com.apple.certificates",
      ],
      "com.apple.private.system-keychain": true,
      ITSAppUsesNonExemptEncryption: false,
      NSCameraUsageDescription: "This app uses the camera to scan SIM cards",
      NSPhotoLibraryUsageDescription:
        "Allow sending screenshots for support requests",
    },
    entitlements: {
      "aps-environment": "development",
      "com.apple.developer.applesignin": ["Default"],
    },
    googleServicesFile: IS_PROD
      ? "./configs/GoogleService-Info.prod.plist"
      : "./configs/GoogleService-Info.dev.plist",
  },
  android: {
    package: IS_PROD ? "xxxx" : "xxxx",
    adaptiveIcon: {
      foregroundImage: IS_PROD
        ? "./assets/images/adaptive-icon.png"
        : "./assets/images/adaptive-icon_test.png",
      backgroundColor: "#FAFF00",
    },
    permissions: [
      "com.google.android.gms.permission.AD_ID",
      "android.permission.READ_PHONE_STATE",
      "android.permission.READ_PRIVILEGED_PHONE_STATE",
      "android.permission.READ_PHONE_NUMBERS",
      "android.permission.WRITE_EMBEDDED_SUBSCRIPTIONS",
    ],
    googleServicesFile: IS_PROD
      ? "./configs/google-services.prod.json"
      : "./configs/google-services.dev.json",
    edgeToEdgeEnabled: false,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFFFFF",
      },
    ],
    "expo-secure-store",
    "expo-asset",
    [
      "expo-local-authentication",
      {
        faceIDPermission: "Allow $(PRODUCT_NAME) to use Face ID.",
      },
    ],
    "@react-native-firebase/app",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
    [
      "expo-tracking-transparency",
      {
        userTrackingPermission:
          "We’ll use your data to optimize your experience and make this app even more amazing.",
      },
    ],
    ["expo-font", {}],
    [
      "expo-camera",
      {
        cameraPermission: "Allow $(PRODUCT_NAME) to access your camera",
        microphonePermission: "Allow $(PRODUCT_NAME) to access your microphone",
        recordAudioAndroid: false,
      },
    ],
    "expo-web-browser",
    [
      "expo-secure-store",
      {
        configureAndroidBackup: true,
      },
    ],
    [
      "react-native-cloud-storage",
      {
        iCloudContainerEnvironment: "Production",
      },
    ],
    ["./plugins/fixes.ts"],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "",
    },
  },
  owner: "xxxx",
});

# Welcome to your Expo telco-crypto-app 👋

## Get started - telco-crypto-app (React Native)

1. Go into `packages/telco-crypto-app`
2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Edit the `.env` file and set the backend API URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000  # Replace with your Core backend URL if needed
```

4. Install dependencies:

```bash
pnpm install
```

5. Open `android/app/build.gradle` in Android Studio to import Gradle configuration
6. Start an Android emulator via Android Studio or connect a physical device
7. Run the app on Android:

```bash
npx expo run:android
```

> 💡 **On macOS with Xcode installed**, install CocoaPods dependencies first:

```bash
cd ios && pod install && cd ..
```

Then run the app on iOS:

```bash
npm run ios
```

## Building

You can mostly follow the instructions here:
https://docs.expo.dev/build/setup/

> Make sure to run any `eas build` commands with the `--local` flag to build the project locally

The most important steps are listed below:

1. `npm install -g eas-cli`
1. `eas login`
1. `eas env:pull --environment preview` To pull an environment and work with it (e.g. in the simulator)
1. `eas build --local --profile preview --platform android` To start a build for a specific platform and environment

Possible environments/profiles are:

- development
- preview
- production

> Local Android Build Setup

Prequisites :

- Java 17 installed:Java 17 is recommended. Do NOT use Java 21 — it causes compatibility issues with Gradle and React Native builds.
- Expo CLI / EAS CLI installed
- Android SDK properly installed under WSL (or access Windows SDK paths)
- Set Environment Variables :

```bash
# 1. Set Android SDK path
export ANDROID_HOME=$HOME/Android/Sdk

# 2. Add Android SDK tools and platform-tools to PATH
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

# 3. Set Java JDK path (example with Java 17)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

- If "aapt" is missing in build-tools, ensure build-tools;34.0.0 is properly installed and change in android/build.gradle
  buildToolsVersion = findProperty('android.buildToolsVersion') ?: '34.0.0'








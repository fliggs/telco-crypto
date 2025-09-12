# Fliggs

## Setup

1. Install [Node.JS](https://nodejs.org) 20+ (v20.3+ recommended)
2. Install [pnpm](https://pnpm.io/)
3. Install [Docker](https://www.docker.com/)
4. Install [JDK 17](https://adoptium.net/) (recommended)
5. Install [Android Studio](https://developer.android.com/studio) (with Android SDK & emulator)
6. Install [Expo CLI](https://docs.expo.dev/get-started/installation/) globally:

```bash
npm install -g expo-cli
```

7. Run `pnpm install` at the root of the project

---

### Core

1. Go to `packages/core`
2. Copy `.env.example` to `.env`
3. GO to `packages/core/config`
4. Copy `auth.yaml.example` to `auth.yaml`

---

### fliggs-app (React Native)

1. Go into `packages/fliggs-app`
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

or

```bash
npx expo run:android
```

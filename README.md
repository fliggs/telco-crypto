# Telco-Crypto Starter Kit

**Telco-Crypto** is a modular, open-source starter kit for launching the next generation of **mobile service providers**, combining traditional telecom infrastructure with **Web3-native identity, attestation, and wallet functionality**. Originally developed as the base layer for a Solana-powered MVNO (Mobile Virtual Network Operator), this project is now open-sourced to accelerate the ecosystem of decentralized, device-bound digital services.

---

## Vision

Telecom is being redefined:

- **Phone numbers are evolving into wallets** — Decentralized identity and cryptographic signatures are replacing legacy KYC.
- **Devices are the new nodes** — Smartphones serve as edge validators, credentials, and endpoints in DePIN networks.
- **The next telco is programmable** — Developers demand open infrastructure to create services that are mobile-native and chain-integrated.

This starter kit exists to help realize this new reality. Whether you're building a decentralized telecom stack, experimenting with Solana-based attestations, or launching a consumer app that blends Web2 usability with Web3 primitives — this repo is your foundation.

---

## Who Is This For?

This project is intended for:

- Solana ecosystem teams building on-chain mobile experiences
- DePIN and digital identity projects needing real-world wallet touchpoints
- Web3 startups exploring user-owned telco infrastructure
- Hackathon teams and researchers prototyping wallet onboarding via mobile

By open-sourcing this stack, we aim to:
- Lower the barrier for mobile-native builders
- Encourage interoperability between telecom and Web3 standards
- Contribute a functional blueprint for programmable SIM/wallet/identity onboarding

---

## What’s Included

This monorepo contains:

- `packages/core`: A backend API (Node.js/TypeScript) with Solana wallet login, user management, and configurable authentication logic
- `packages/app`: A React Native mobile application (Expo) for onboarding, device activation, and end-user flows
- `packages/api-client-ts`: A shared TypeScript client for interacting with the backend
- `packages/expo-google-authentication`: Modular Google login integration for Expo

All components are designed to be modular, developer-friendly, and production-extendable.

---

## Architecture Overview

```text
packages/
├── core                         # Node.js backend API with Solana wallet + user management
├── app                          # Expo-based React Native mobile app (Telco client)
├── api-client-ts               # Typed client for interacting with the backend
├── expo-google-authentication  # Modular Google login for Expo apps
```

Tech highlights:
- TypeScript throughout
- Monorepo using `pnpm` workspaces
- Docker-compatible for local and CI environments
- Uses `.env` and `.yaml` for clear configuration separation

---

## Quickstart Guide

### Requirements

Make sure you have:
- [Node.js](https://nodejs.org) v20+
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)
- [JDK 17](https://adoptium.net/)
- [Android Studio](https://developer.android.com/studio)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

```bash
npm install -g expo-cli
```

---

### Step 1: Install Dependencies

```bash
pnpm install
```

---

### Step 2: Core Backend Setup

```bash
cd packages/core
cp .env.example .env
cd config
cp auth.yaml.example auth.yaml
```

Edit `.env` and `auth.yaml` to suit your environment (e.g. database, JWT, Solana RPC, etc.).

Then start the API:

```bash
pnpm dev
```

> Runs on `http://localhost:3000`

---

### Step 3: Mobile App Setup

```bash
cd packages/app
cp .env.example .env
```

Set your backend URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Install dependencies:

```bash
pnpm install
```

#### Run on Android

1. Launch Android Studio and open an emulator or connect a device
2. Run:

```bash
npx expo run:android
```

#### Run on iOS (macOS only)

```bash
cd ios && pod install && cd ..
npm run ios
```

---

## Roadmap & Contributions

We are actively evolving this project. Current roadmap includes:

- Full eSIM lifecycle integration (provisioning, switching, revocation)
- Solana Attestation Service support for verified identity
- WalletConnect v2 integration
- Web3 push notifications
- Multilingual support

We welcome contributors, issue submissions, and forks.

---

## License

MIT — commercial and non-commercial use permitted with attribution.

> If you use this project in your grant, research, or venture — let us know or consider contributing back. We’re building this ecosystem together.

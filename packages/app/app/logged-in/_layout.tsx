import { Redirect, Stack } from "expo-router";
import { useState } from "react";

import { useMe } from "@/providers/MeProvider";
import { useApi } from "@/providers/ApiProvider";
import { useAppState } from "@/providers/AppStateProvider";
import { PaymentProvider } from "@/providers/PaymentProvider";
import { SubscriptionsProvider } from "@/providers/SubscriptionsProvider";
import { WalletProvider } from "@/providers/WalletProvider";
import { LockProvider } from "@/providers/LockProvider";

export default function LoggedInLayout() {
  const { healthApi } = useApi();
  const { me } = useMe(false);

  if (!me) {
    console.log("[MAIN]", "not logged in, redirecting");
    return <Redirect href="/" />;
  }

  return (
    <SubscriptionsProvider>
      <PaymentProvider>
        <LockProvider>
          <WalletProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </WalletProvider>
        </LockProvider>
      </PaymentProvider>
    </SubscriptionsProvider>
  );
}

import { Redirect, Stack } from "expo-router";
import { OrderStatus, OrderType } from "api-client-ts";

import { Color, Spacing } from "@/constants";
import { CurrentOrderProvider } from "@/providers/CurrentOrderProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";

export default function OnboardingLayout() {
  const { isRequiredComplete } = useOnboardingProgress();

  if (isRequiredComplete) {
    console.log("onboarding complete, redirecting to main");
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <CurrentOrderProvider type={OrderType.AddPlan} status={OrderStatus.Draft}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            display: "flex",
            flexDirection: "column",
            gap: Spacing.MEDIUM,
            backgroundColor: Color.BLACK,
          },
        }}
      >
        <Stack.Screen name="ADDRESS/index" />
        <Stack.Screen name="CONTENT/index" />
        <Stack.Screen name="KYC/index" />
        <Stack.Screen name="ORDER_CONFIRM/index" />
        <Stack.Screen name="ORDER_MSISDN/index" />
        <Stack.Screen name="ORDER_MSISDN/step2" />
        <Stack.Screen name="ORDER_MSISDN/step3" />
        <Stack.Screen name="ORDER_PLAN/index" />
        <Stack.Screen name="ORDER_PROCESS/index" />
        <Stack.Screen name="ORDER_SIM_TYPE/index" />
        <Stack.Screen name="ORDER_SIM_TYPE/esim" />
        <Stack.Screen name="ORDER_SIM_TYPE/manual" />
        <Stack.Screen name="ORDER_SIM_TYPE/shipping" />
        <Stack.Screen name="PAYMENT/index" />
      </Stack>
    </CurrentOrderProvider>
  );
}

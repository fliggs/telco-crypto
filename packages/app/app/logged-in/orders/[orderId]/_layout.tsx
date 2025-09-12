import { Redirect, Stack, useLocalSearchParams } from "expo-router";

import { OrderProvider } from "@/providers/OrderProvider";
import { Color, Spacing } from "@/constants";

export default function OrderLayout() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();

  if (!orderId) {
    return <Redirect href="/logged-in/main" />;
  }

  return (
    <OrderProvider orderId={orderId}>
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
        <Stack.Screen name="confirm" />
        <Stack.Screen name="msisdn/index" />
        <Stack.Screen name="msisdn/step2" />
        <Stack.Screen name="msisdn/step3" />
        <Stack.Screen name="sim-type/index" />
        <Stack.Screen name="sim-type/esim" />
        <Stack.Screen name="sim-type/manual" />
        <Stack.Screen name="sim-type/shipping" />
        <Stack.Screen name="sim-type/scan" />
        <Stack.Screen name="process" />
      </Stack>
    </OrderProvider>
  );
}

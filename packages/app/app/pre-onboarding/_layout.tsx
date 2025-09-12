import { Redirect, Stack } from "expo-router";

import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { Color, Spacing } from "@/constants";

export default function PreOnboardingLayout() {
  const { isOptionalComplete } = useOnboardingProgress();

  if (isOptionalComplete) {
    console.log("pre-onboarding complete, redirecting");
    return <Redirect href="/" />;
  }

  return (
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
      <Stack.Screen name="CONTENT" getId={({ params }) => params?.stage} />
    </Stack>
  );
}

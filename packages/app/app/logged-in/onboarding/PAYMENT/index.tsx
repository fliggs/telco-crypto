import { router } from "expo-router";
import { useEffect } from "react";

export default function OnboardingPayment() {
  useEffect(() => {
    router.back();
  }, []);

  return null;
}

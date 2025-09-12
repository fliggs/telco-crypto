import { router } from "expo-router";
import { useEffect } from "react";

export default function OnboardingKyc() {
  useEffect(() => {
    router.back();
  }, []);

  return null;
}

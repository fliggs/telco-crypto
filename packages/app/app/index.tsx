import { Redirect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Application from "expo-application";
import { isBefore, add } from "date-fns";

import { useMe } from "@/providers/MeProvider";
import { useApi } from "@/providers/ApiProvider";
import { isNewerVersion } from "@/util";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { get, set } from "@/storage";
import CustomSplashScreen from "@/app/splash";
import ConsentScreen from "@/components/ConsentScreen";
import 'react-native-get-random-values'; 
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { healthApi } = useApi();
  const { me } = useMe(false);
  const { isOptionalComplete } = useOnboardingProgress();
  const [isReady, setIsReady] = useState(false);
  const [consent, setConsent] = useState(get("consent", false));
  const [requiresUpdate, setRequiresUpdate] = useState(false);

  const handleConsent = useCallback(() => {
    set("consent", true);
    setConsent(true);
  }, []);
  

  useEffect(() => {
    console.log("[STARTUP] ", "checking health status...");
    const controller = new AbortController();
    const signal = controller.signal;

    const timer = setTimeout(() => {
      console.error("[STARTUP]", "health check aborted");
      controller.abort("Timeout");
    }, 5000);

    healthApi
      .healthCheckV1(undefined, { signal })
      .then((health) => {
        const version = Application.nativeApplicationVersion || "0.0.1";
        const minVersion = health.details?.mobile_app.minVersion[Platform.OS];
        const isUpToDate = isNewerVersion(version, minVersion);
        console.log("[STARTUP]", "versions", version, minVersion, isUpToDate);

        if (!isUpToDate) {
          setRequiresUpdate(true);
        }
      })
      .finally(() => {
        console.log("[STARTUP]", "hiding splash screen");
        clearInterval(timer);
        SplashScreen.hideAsync();
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return <CustomSplashScreen />;
  }
  if (requiresUpdate) {
    return <Redirect href="/update-app" />;
  }
  if (!isOptionalComplete) {
    return <Redirect href="/pre-onboarding" />;
  }

  if (!consent) {
    return <ConsentScreen onComplete={handleConsent} />;
  }

  if (me) {
    const now = new Date();
    const createdAt = me.createdAt;
    const isNewUser = isBefore(now, add(createdAt, { minutes: 2.5 }));

    if (!me.firstName || !me.lastName || isNewUser) {
      return <Redirect href="/sign-up?mode=complete" />;
    } else {
      return <Redirect href="/logged-in/main" />;
    }
  }
  return <Redirect href="/sign-in" />;
}

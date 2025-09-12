import "../i18n";
import "react-native-get-random-values";
import { Stack, usePathname } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { getAnalytics, logScreenView } from "@react-native-firebase/analytics";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { I18nextProvider } from "@/node_modules/react-i18next";
import i18n from "@/i18n";

import { MeProvider } from "@/providers/MeProvider";
import { ApiProvider } from "@/providers/ApiProvider";
import { AppStateProvider } from "@/providers/AppStateProvider";
import { BottomSheetProvider } from "@/providers/BottomSheetProvider";
import { ErrorSheetProvider } from "@/providers/ErrorSheetProvider";
import { SupportProvider } from "@/providers/SupportProvider";
import { LocalAuthProvider } from "@/providers/LocalAuthProvider";
import { SocialAuthProvider } from "@/providers/SocialAuthProvider";
import { OffersProvider } from "@/providers/OffersProvider";
import { OnboardingStagesProvider } from "@/providers/OnboardingStagesProvider";
import { OnboardingProgressProvider } from "@/providers/OnboardingProgressProvider";

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function RootLayout() {
  const pathname = usePathname();

  useEffect(() => {
    logScreenView(getAnalytics(), {
      screen_name: pathname,
      screen_class: pathname,
    });
  }, [pathname]);

  return (
    <GestureHandlerRootView>
      <AppStateProvider>
        <SafeAreaProvider>
          <I18nextProvider i18n={i18n}>
            <BottomSheetProvider>
              <ErrorSheetProvider>
                <ApiProvider>
                  <SocialAuthProvider>
                    <LocalAuthProvider>
                      <SupportProvider>
                        <MeProvider>
                          <OnboardingStagesProvider>
                            <OnboardingProgressProvider>
                              <OffersProvider>
                                <Stack screenOptions={{ headerShown: false }} />
                              </OffersProvider>
                            </OnboardingProgressProvider>
                          </OnboardingStagesProvider>
                        </MeProvider>
                      </SupportProvider>
                    </LocalAuthProvider>
                  </SocialAuthProvider>
                </ApiProvider>
              </ErrorSheetProvider>
            </BottomSheetProvider>
          </I18nextProvider>
        </SafeAreaProvider>
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}

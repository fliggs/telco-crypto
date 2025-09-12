import React, { useEffect } from "react";
import { Image, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";

export default function CustomSplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Image style={{ width: "100%", height: "100%" }} resizeMode="cover" />
    </View>
  );
}

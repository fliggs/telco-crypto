import { FC, useEffect } from "react";
import { BackHandler, View } from "react-native";
import { router } from "expo-router";

import { Color, Spacing } from "@/constants";

import SvgChevronLeft from "@/assets/icons/chevron-left.svg";
import SvgHamburger from "@/assets/icons/hamburger.svg";

import Button, { ButtonType } from "./Button";

interface Props {
  showSettings?: boolean;
  showBack?: boolean;
  chevronColor?: string;
  onBackPress?: () => void;
}

const Header: FC<Props> = ({
  showBack,
  showSettings,
  chevronColor,
  onBackPress,
}) => {
  useEffect(() => {
    if (showBack) {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (onBackPress) {
          onBackPress();
        } else if (router.canGoBack?.()) {
          router.back();
        } else {
          router.replace("/");
        }
        return true;
      });
      return () => sub.remove();
    }
  }, [onBackPress, showBack]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {showBack && (
        <Button
          style={{ marginLeft: -Spacing.SMALL, marginTop: -Spacing.SMALL }}
          compact
          type={ButtonType.TRANSPARENT}
          onPress={() => {
            if (onBackPress) {
              onBackPress();
            } else if (router.canGoBack?.()) {
              router.back();
            } else {
              router.replace("/");
            }
          }}
        >
          <SvgChevronLeft color={chevronColor ?? Color.WHITE} />
        </Button>
      )}

      {showSettings && (
        <Button
          compact="no-padding"
          type={ButtonType.TRANSPARENT}
          onPress={() => router.navigate("/logged-in/main/account")}
        >
          <SvgHamburger color={Color.WHITE} />
        </Button>
      )}
    </View>
  );
};

export default Header;

import { Link, LinkProps } from "expo-router";
import { FC, PropsWithChildren } from "react";
import { View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

import { Color, Spacing } from "@/constants";
import SvgChevronRight from "@/assets/icons/chevron-right.svg";

import Text, { TextVariant } from "./Text";

interface Props extends PropsWithChildren, LinkProps {
  comingSoon?: boolean;
  notButton?: boolean;
  noChevron?: boolean;
}

const MenuItemLink: FC<Props> = ({
  children,
  comingSoon,
  notButton,
  noChevron,
  ...props
}) => {
  if (comingSoon && process.env.NODE_ENV === "production") {
    return null;
  }
  const child =
    typeof children === "string" ? (
      // <View
      //   style={{
      //     flex: 1,
      //     justifyContent: "center",
      //   }}
      // >

      //   <View style={{ flex: 1, justifyContent: "center", }}>
      //     <Text
      //       variant={notButton ? TextVariant.H4 : TextVariant.Button}
      //       color={Color.WHITE}
      //       style={{
      //         flex: 1,
      //         includeFontPadding: false,
      //         textAlignVertical: "center",
      //         lineHeight:10
      //       }}
      //       numberOfLines={1}
      //       ellipsizeMode="tail"
      //     >
      //       {children}
      //     </Text>
      //   </View>

      // </View>
      <Text
        variant={notButton ? TextVariant.H4 : TextVariant.Button}
        color={Color.WHITE}
        style={{
          includeFontPadding: false,
          textAlignVertical: "center",
        }}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {children}
      </Text>
    ) : (
      children
    );

  return (
    <Link {...props} asChild>
      <RectButton
        style={{
          backgroundColor: Color.DARK,
          paddingHorizontal: Spacing.MEDIUM,
          paddingVertical: Spacing.MEDIUM,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 48,
        }}
      >
        {child}

        {comingSoon ? (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 100,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              flexDirection: "row",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingRight: Spacing.MEDIUM,
            }}
          >
            <Text color={Color.WHITE}>Coming soon</Text>
          </View>
        ) : !noChevron ? (
          <SvgChevronRight color={Color.WHITE} />
        ) : null}
      </RectButton>
    </Link>
  );
};

export default MenuItemLink;

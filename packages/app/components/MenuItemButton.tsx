import { FC, PropsWithChildren } from "react";
import { View } from "react-native";
import { RectButton, RectButtonProps } from "react-native-gesture-handler";

import { Color, Spacing } from "@/constants";

import SvgChevronRight from "@/assets/icons/chevron-right.svg";

import Text, { TextVariant } from "./Text";

interface Props extends PropsWithChildren, RectButtonProps {
  primary?: boolean;
  onPress: () => void;
  notButton?: boolean;
}

const MenuItemButton: FC<Props> = ({
  primary,
  notButton,
  children,
  ...props
}) => {
  const child =
    typeof children === "string" ? (
      <Text
        variant={notButton ? TextVariant.H4 : TextVariant.Button}
        color={primary ? Color.BLACK : Color.WHITE}
      >
        {children}
      </Text>
    ) : (
      children
    );

  return (
    <RectButton {...props}>
      <View
        style={{
          backgroundColor: primary ? Color.PRIMARY : Color.DARK,
          padding: Spacing.MEDIUM,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: primary ? "center" : "space-between",
          alignItems: "center",
        }}
      >
        {child}
        {!primary && <SvgChevronRight color={Color.WHITE} />}
      </View>
    </RectButton>
  );
};

export default MenuItemButton;

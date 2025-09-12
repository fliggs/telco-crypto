import { FC } from "react";
import { RectButton, RectButtonProps } from "react-native-gesture-handler";

import { Color, Spacing } from "@/constants";

import Text, { TextVariant } from "./Text";

export enum ButtonType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  SECONDARY_INV = "secondary_inv",
  TRANSPARENT = "transparent",
  TRANSPARENT_BORD = "transparent_bord",
  TRANSPARENT_BORD_BLACK = "transparent_bord_black",
  DARK = "gray",

}

interface Props extends RectButtonProps {
  type?: ButtonType;
  compact?: boolean | "no-padding";
  textColor?: Color;
  textVariant?: TextVariant;

}

const Button: FC<Props> = ({
  type,
  compact,
  children,
  enabled,
  textColor,
  style,
  textVariant,
  ...props
}) => {
  return (
    <RectButton
      {...props}
      enabled={enabled}
      style={[
        {
          backgroundColor:
            type === ButtonType.SECONDARY
              ? Color.BLACK
              : type === ButtonType.SECONDARY_INV
                ? Color.WHITE
                : type === ButtonType.TRANSPARENT ||
                  type === ButtonType.TRANSPARENT_BORD ||
                  type === ButtonType.TRANSPARENT_BORD_BLACK
                  ? "transparent"
                  : type === ButtonType.DARK
                    ? Color.DARK
                    : Color.PRIMARY,

          borderWidth:
            type === ButtonType.SECONDARY_INV ||
              type === ButtonType.TRANSPARENT_BORD ||
              type === ButtonType.TRANSPARENT_BORD_BLACK
              ? 1
              : 0,

          borderColor:
            type === ButtonType.SECONDARY_INV ||
              type === ButtonType.TRANSPARENT_BORD_BLACK
              ? Color.BLACK
              : type === ButtonType.TRANSPARENT_BORD
                ? Color.WHITE
                : undefined,

          padding:
            compact === "no-padding"
              ? 0
              : compact
                ? Spacing.SMALL
                : Spacing.MEDIUM,

          opacity: enabled !== false ? 1 : 0.5,
        },
        style,
      ]}
    >
      <Text
        variant={textVariant ?? TextVariant.Button}
        color={
          textColor ??
          (type === ButtonType.SECONDARY || type === ButtonType.DARK
            ? Color.WHITE
            : type === ButtonType.SECONDARY_INV
              ? Color.BLACK
              : type === ButtonType.TRANSPARENT ||
                type === ButtonType.TRANSPARENT_BORD ||
                type === ButtonType.TRANSPARENT_BORD_BLACK
                ? Color.WHITE
                : Color.BLACK)
        }
        numberOfLines={1}
        style={{
          textAlign: "center",
          includeFontPadding: false,
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        {children}
      </Text>
    </RectButton>
  );
};

export default Button;

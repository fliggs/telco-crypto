import { FC } from "react";
import { TextProps, TextStyle, Text as Txt } from "react-native";

import { Color } from "@/constants";

export enum TextVariant {
  H1 = "h1",
  H2 = "h2",
  H3 = "h3",
  H4 = "h4",
  H5 = "h5",
  BodyLarge = "body_large",
  BodyMedium = "body_medium",
  BodySmall = "body_small",
  Fineprint = "fineprint",
  Description = "description",
  Link = "link",
  Button = "button",
  PriceLargeBold = "price_large_bold",
  PriceLargeRegular = "price_large_regular",
  PriceMedium = "price_medium",
}

const VARIANTS = new Set<string | null | undefined>(Object.values(TextVariant));
export function getTextVariant(
  variant: string | null | undefined,
  def: TextVariant
) {
  return (
    TextVariant[variant as unknown as keyof typeof TextVariant] ??
    (VARIANTS.has(variant) ? variant : def)
  );
}

interface Props extends TextProps {
  variant?: TextVariant;
  color?: Color;
}

const Text: FC<Props> = ({ variant, color, style, children, ...props }) => {
  const textProps = getPropsForVariant(variant ?? TextVariant.BodyMedium);
  const colorStyle = { color: color ?? Color.PRIMARY };

  return (
    <Txt {...props} style={[textProps, colorStyle, style]}>
      {children}
    </Txt>
  );
};

export default Text;

function getPropsForVariant(variant: TextVariant): TextStyle {
  switch (variant) {
    case TextVariant.H1:
      return {
        fontSize: 56,
      };

    case TextVariant.H2:
      return {
        fontSize: 48,
      };

    case TextVariant.H3:
      return {
        fontSize: 36,
      };

    case TextVariant.H4:
      return {
        fontSize: 24,
      };

    case TextVariant.H5:
      return {
        fontSize: 18,
      };

    case TextVariant.BodyLarge:
      return {
        fontSize: 20,
      };

    case TextVariant.BodyMedium:
      return {
        fontSize: 18,
      };

    case TextVariant.BodySmall:
      return {
        fontSize: 16,
      };

    case TextVariant.Fineprint:
      return {
        fontSize: 14,
      };

    case TextVariant.Description:
      return {
        fontSize: 18,
      };

    case TextVariant.Link:
      return {
        color: Color.PRIMARY,
        fontSize: 18,
      };

    case TextVariant.Button:
      return {
        fontSize: 18,
        textTransform: "uppercase",
      };

    case TextVariant.PriceLargeBold:
      return {
        fontSize: 32,
        fontWeight: 700,
      };

    case TextVariant.PriceLargeRegular:
      return {
        fontSize: 32,
        fontWeight: 400,
      };
    case TextVariant.PriceMedium:
      return {
        fontSize: 24,
        fontWeight: 400,
      };
  }
}

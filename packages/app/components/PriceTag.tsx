import React from "react";
import { Platform, View } from "react-native";
import Text, { TextVariant } from "./Text";
import { Color, Spacing } from "@/constants";
import { formatCost, splitNumber } from "@/util";
import { isValidRubberBandConfig } from "react-native-reanimated/lib/typescript/animation/decay/utils";

interface PriceTagProps {
  value: string;
  showSuffix?: boolean;
  suffix?: string;
  variant?: priceVariant;
  color?: string;
}

export enum priceVariant {
  SMALL = "small",
  LARGE = "large",
}
const PriceTag = ({
  value,
  showSuffix = true,
  suffix,
  variant = priceVariant.LARGE,
  color = Color.BLACK,
}: PriceTagProps) => {
  const { entier, decimal } = splitNumber(formatCost(value, false)) ?? {
    entier: "0",
    decimal: "00",
  };

  const displayDecimal = decimal.toString().padEnd(2, "0");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: Spacing.SMALL,
      }}
    >
      <Text
        variant={
          variant == priceVariant.SMALL
            ? TextVariant.Description
            : TextVariant.PriceLargeRegular
        }
        style={{
          marginRight: variant == priceVariant.SMALL ? 2 : Spacing.SMALL,
          transform:
            Platform.OS == "ios"
              ? [{ translateY: -Spacing.SMALL }]
              : [{ translateY: Spacing.SMALL }],
          color: color,
        }}
      >
        $
      </Text>

      <Text
        variant={
          variant == priceVariant.SMALL ? TextVariant.H4 : TextVariant.H1
        }
        style={{ color: color }}
      >
        {entier}
      </Text>

      <Text
        variant={
          variant == priceVariant.SMALL
            ? TextVariant.H5
            : TextVariant.PriceLargeBold
        }
        style={{
          alignSelf: "flex-end",
          transform:
            variant == priceVariant.SMALL
              ? [{ translateY: -Spacing.SMALL }]
              : Platform.OS == "ios"
              ? [{ translateY: -25 }]
              : [{ translateY: -Spacing.MEDIUM }],
          color: color,
        }}
      >
        .{displayDecimal}
      </Text>

      {showSuffix && (
        <Text
          variant={
            variant == priceVariant.SMALL
              ? TextVariant.Description
              : TextVariant.PriceLargeRegular
          }
          style={{
            marginLeft: 4,
            alignSelf: "flex-end",
            transform:
              variant == priceVariant.SMALL
                ? [{ translateY: -12 }]
                : Platform.OS == "ios"
                ? [{ translateY: -25 }]
                : [{ translateY: -Spacing.MEDIUM }],
            color: color,
          }}
        >
          {suffix}
        </Text>
      )}
    </View>
  );
};

export default PriceTag;

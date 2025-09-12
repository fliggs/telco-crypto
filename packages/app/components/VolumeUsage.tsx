import { PublicVolumeUsageDto, VolumeType } from "api-client-ts";
import { View } from "react-native";
import { useMemo } from "react";

import { Color, Spacing } from "@/constants";
import { formatData, formatVolume } from "@/util";

import Text, { TextVariant } from "./Text";

interface Props {
  usage: PublicVolumeUsageDto;
}

export default function VolumeUsage({ usage }: Props) {
  const label = useMemo(
    () =>
      usage.type === VolumeType.Data
        ? usage.isRoaming
          ? "Data"
          : "High speed data"
        : usage.type === VolumeType.Call
        ? "Minutes"
        : usage.type === VolumeType.Credit
        ? "$ Credit"
        : "SMS",
    [usage]
  );

  return (
    <View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: Spacing.SMALL,
        }}
      >
        <Text color={Color.WHITE} variant={TextVariant.BodySmall}>
          {label}
        </Text>
        <Text color={Color.WHITE} variant={TextVariant.BodySmall}>
          {formatVolume(usage.type, usage.amountTotal)}
        </Text>
      </View>

      <View
        style={{
          position: "relative",
          width: "100%",
          backgroundColor: Color.BLACK,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            justifyContent:
              Number(usage.amountUsed) / Number(usage.amountTotal) == 1
                ? "center"
                : "flex-start",
            paddingRight: Spacing.SMALL,
            width: `${
              (Number(usage.amountUsed) / Number(usage.amountTotal)) * 100
            }%`,
            backgroundColor: Color.PRIMARY,
          }}
        >
          <Text
            color={Color.BLACK}
            numberOfLines={1}
            variant={TextVariant.BodySmall}
            style={{ textAlign: "center" }}
          >
            {formatData(usage.amountUsed)}
          </Text>
        </View>
      </View>
    </View>
  );
}

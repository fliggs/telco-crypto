import React, { FC, useEffect } from "react";
import { View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

import { Spacing, Color } from "@/constants";

import Text, { TextVariant } from "./Text";

import SvgChevronLeft from "@/assets/icons/chevron-left.svg";
import SvgChevronRight from "@/assets/icons/chevron-right.svg";

interface AccordionData {
  title: string;
  description?: string;
}

interface Props {
  data: AccordionData;
  show: boolean;
  onShow?: () => void;
  onClose?: () => void;
  variant?: string;
}

const AccordionBlock: FC<Props> = ({
  data,
  show,
  onShow,
  onClose,
  variant,
}) => {
  useEffect(() => {
    if (show && onShow) onShow();
    if (!show && onClose) onClose();
  }, [show]);

  return (
    <View
      style={{
        backgroundColor: variant ? Color.WHITE : Color.DARK,
        paddingHorizontal: variant ? Spacing.SMALL : Spacing.MEDIUM,
        paddingVertical: Spacing.MEDIUM,
      }}
    >
      <RectButton
        onPress={show ? onClose : onShow}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          variant={variant ? TextVariant.Description : TextVariant.H4}
          color={variant ? Color.DARK : Color.WHITE}
        >
          {data.title}
        </Text>
        {show ? (
          <SvgChevronLeft
            color={variant ? Color.DARK : Color.WHITE}
            style={{
              transform: [
                { translateX: 0 },
                { translateY: 0 },
                { rotate: "90deg" },
              ],
            }}
          />
        ) : (
          <SvgChevronRight
            color={variant ? Color.DARK : Color.WHITE}
            style={{
              transform: [
                { translateX: 0 },
                { translateY: 0 },
                { rotate: "90deg" },
              ],
            }}
          />
        )}
      </RectButton>

      {show && (
        <View>
          {data.description ? (
            <Text
              variant={TextVariant.BodySmall}
              color={variant ? Color.DARK : Color.WHITE}
            >
              {data.description}
            </Text>
          ) : (
            <>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: Spacing.MEDIUM,
                  paddingTop: Spacing.MEDIUM,
                  borderTopColor: "white",
                  borderTopWidth: 1,
                }}
              >
                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.WHITE}
                  style={{ width: "45%" }}
                >
                  Monthly cashback
                </Text>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    // alignItems: "flex-end",
                    width: "45%",
                  }}
                >
                  <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    5% for one plan.
                  </Text>
                  <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    10% for 2 or more.
                  </Text>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: Spacing.MEDIUM,
                  paddingTop: Spacing.MEDIUM,
                  borderTopColor: "white",
                  borderTopWidth: 1,
                }}
              >
                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.WHITE}
                  style={{ width: "45%" }}
                >
                  Referral bonus
                </Text>

                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.WHITE}
                  style={{ width: "45%" }}
                >
                  $5.00 per month in your first 10 months.
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  marginTop: Spacing.MEDIUM,
                  paddingTop: Spacing.MEDIUM,
                  borderTopColor: "white",
                  borderTopWidth: 1,
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  {"paid to your wallet"}
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default AccordionBlock;

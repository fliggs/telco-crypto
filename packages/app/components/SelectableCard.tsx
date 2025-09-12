import React from "react";
import { StyleProp, TouchableOpacity, View, ViewStyle, } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Color, Spacing } from "@/constants";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Text, { TextVariant } from "./Text";

export enum CardVariant {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  SECONDARY_INV = "secondary_inv",
  TRANSPARENT = "transparent",
}

interface Props {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
}

const SelectableCard: React.FC<Props> = ({ title, description, selected, onPress, variant = CardVariant.PRIMARY,
  style }) => {

  const getBackgroundColor = () => {
    switch (variant) {
      case CardVariant.SECONDARY:
        return Color.DARK;
      case CardVariant.SECONDARY_INV:
        return Color.WHITE;
      case CardVariant.TRANSPARENT:
        return "transparent";
      default:
        return Color.PRIMARY;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case CardVariant.SECONDARY:
      case CardVariant.TRANSPARENT:
        return Color.WHITE;
      case CardVariant.SECONDARY_INV:
        return Color.BLACK;
      default:
        return Color.BLACK;
    }
  };


  return (
    <TouchableOpacity
      onPress={onPress}

      style={{
        backgroundColor: getBackgroundColor(),
        padding: Spacing.MEDIUM,
        flexDirection: "row",
      }}

    >
      <View style={{ flex: 1 }}>
        <View style={{
          flexDirection:'row',
          justifyContent:'space-between',
          alignItems:'center',
          alignContent:'center',
         }}>
          <Text
              variant={TextVariant.H4}
              color={Color.WHITE}
              style={{ paddingTop:Spacing.SMALL}}
            >
              {title}
          </Text>
          {selected ? (
            <Ionicons name="checkmark-circle" size={34} color={Color.PRIMARY} />
          ) : (
            <FontAwesome name="circle-thin" size={34} color={Color.WHITE} />
          )}
        </View>
        
        {selected && description && (
          <Text
            variant={TextVariant.BodySmall}
            color={getTextColor()}
            style={{marginTop:Spacing.SMALL}}
          >
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SelectableCard;

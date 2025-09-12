// SimpleSelectorItem.tsx
import React from "react";
import { View } from "react-native";
import Text, { TextVariant } from "@/components/Text";
import Button, { ButtonType } from "@/components/Button";
import SvgCheck from "@/assets/icons/check.svg";
import { Color } from "@/constants";

interface SimpleSelectorItemProps {
    id: string;
    label: string;
    width: string;
    isSelected: boolean;
    onPress: () => void;
}

const SimpleSelectorItem: React.FC<SimpleSelectorItemProps> = ({
    id,
    label,
    width,
    isSelected,
    onPress
}) => {
    return (
        <Button
            type={ButtonType.TRANSPARENT}
            onPress={onPress}
            style={{
                marginBottom: 2,
                paddingHorizontal: 0,
                padding: 0,
                height: 70,
                alignItems: "center",
                alignContent: "center",
                width,
                backgroundColor: isSelected ? Color.PRIMARY : Color.DARK,
                borderWidth: 0
            }}
        >
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    position: "relative",
                    width: "100%"
                }}
            >
                <Text
                    variant={TextVariant.H4}
                    color={isSelected ? Color.BLACK : Color.WHITE}
                    style={{
                        textAlign: "center",
                        padding: 0,
                        marginTop: 25,
                        height: 35
                    }}
                >
                    {label}
                </Text>
            </View>

            {isSelected && (
                <SvgCheck
                    style={{
                        position: "absolute",
                        right: 6,
                        top: 6
                    }}
                />
            )}
        </Button>
    );
};

export default SimpleSelectorItem;

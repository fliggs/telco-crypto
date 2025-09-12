import React from "react";
import { View } from "react-native";
import Text, { TextVariant } from "@/components/Text";
import Button, { ButtonType } from "@/components/Button";
import SvgPolygon from "@/assets/icons/polygon.svg";
import SvgCheck from "@/assets/icons/check.svg";
import { Color, Spacing } from "@/constants";
import { getCheckIconStyle } from "@/util";

interface OfferItemProps {
    offer: any;
    index: number;
    width: number;
    selOffer: any;
    offers: any[];
    onChange: (offer: any) => void;
}

const OfferItem = ({
    offer,
    index,
    width,
    selOffer,
    offers,
    onChange,
}: OfferItemProps) => {
    const isSelected = selOffer?.id === offer.id;
    const is3ItemsFix = offers.length === 3;
    const itemWidth =
        offers.length > 3 && index < 3
            ? "31.5%"
            : is3ItemsFix
                ? `${100 / 3 - 2}%`
                : "48.5%";

    const textBlockWidth = is3ItemsFix
        ? width / 3 - 20
        : index < 3
            ? (width - 58) / 3
            : index === 3
                ? width / 2 - 25.5
                : width / 2 - 25;


    const triangleWidth = is3ItemsFix
        ? width / 3 - 30
        : index < 3
            ? (width - 66) / 3
            : width / 2 - 40 + 12;

    return (
        <React.Fragment key={offer.id}>
            <Button
                type={ButtonType.TRANSPARENT}
                onPress={() => onChange(offer)}
                style={{
                    marginBottom: 2,
                    paddingHorizontal: 0,
                    padding: 0,
                    height: 70,
                    alignItems: "center",
                    alignContent: "center",
                    width: itemWidth,
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
                        width: "100%",
                    }}
                >
                    {offer.originalCost &&
                        selOffer.originalCost !== selOffer.cost &&
                        (isSelected ? (
                            <Text
                                variant={TextVariant.Description}
                                color={Color.WHITE}
                                style={{
                                    backgroundColor: Color.PETROL,
                                    padding: 0,
                                    textAlign: "center",
                                    width: textBlockWidth,
                                    marginBottom: Spacing.SMALL,
                                    marginTop: 0,
                                    minHeight: Spacing.MEDIUM,
                                }}
                            >
                                {offer.content?.title}
                            </Text>
                        ) : (
                            <View
                                style={{
                                    width: triangleWidth,
                                    marginTop: 0,
                                }}
                            >
                                <SvgPolygon
                                    style={{
                                        marginBottom: 5,
                                        marginLeft: offers.length > 2 ? -2 : -1

                                    }}
                                />
                            </View>
                        ))}

                    <Text
                        variant={TextVariant.H4}
                        color={isSelected ? Color.BLACK : Color.WHITE}
                        style={{
                            textAlign: "center",
                            padding: 0,
                            marginTop:
                                offer.originalCost &&
                                    selOffer.originalCost !== selOffer.cost
                                    ? -3
                                    : 25,
                            height: 35,
                        }}
                    >
                        {offer.plan.content.title ?? offer.plan.name}
                    </Text>
                </View>
            </Button>

            {isSelected && (
                <SvgCheck
                    style={getCheckIconStyle(index, offers.length, width)}
                />
            )}
        </React.Fragment>
    );
};

export default OfferItem;

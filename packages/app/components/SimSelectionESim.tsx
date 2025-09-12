import { View } from "react-native";
import React from "react";
import { RectButton } from "react-native-gesture-handler";

import { Color, Spacing } from "@/constants";

import Text, { TextVariant } from "./Text";
import Button from "./Button";
import BottomSheet from "./BottomSheet";

interface Props {
  esimSupported: boolean;
  thisPhone: boolean;
  onContinue: () => void;
}

export default function SimSelectionESim({
  onContinue,
  esimSupported,
  thisPhone,
}: Props) {
  return (
    <>
      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Your eSIM.
      </Text>

      {esimSupported ? (
        <>
          <Text color={Color.WHITE} style={{ marginBottom: Spacing.MEDIUM }}>
            {thisPhone && (
              <Text color={Color.WHITE}>
                We’ve detected that your phone is eSIM compatible.
              </Text>
            )}
            You‘ll receive a QR-code for your eSIM once your order has been
            confirmed.
          </Text>
          <Text color={Color.WHITE} style={{ marginBottom: Spacing.MEDIUM }}>
            eSIM is the fastest and easiest way to activate your subscription.
          </Text>
        </>
      ) : (
        <>
          <Text color={Color.WHITE} variant={TextVariant.BodyLarge}>
            We couldn't automatically detect if your phone supports eSIM.
            {"\n\n"}
            Do you want to proceed with eSIM anyway? {"\n\n"}
            You‘ll then receive a QR-code for your eSIM once your order has been
            confirmed.{"\n\n"}
            eSIM is the fastest and easiest way to activate your subscription.
          </Text>
        </>
      )}

      <BottomSheet
        trigger={(show) => (
          <RectButton onPress={show}>
            <Text variant={TextVariant.Description} color={Color.PRIMARY}>
              What is an eSIM {">"}
            </Text>
          </RectButton>
        )}
      >
        <>
          <Text
            variant={TextVariant.H4}
            color={Color.BLACK}
            style={{ marginBottom: Spacing.SMALL }}
          >
            What is an eSIM.
          </Text>
          <Text variant={TextVariant.Description} color={Color.BLACK}>
            eSIM
          </Text>
          <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem
            obcaecati magnam, nulla natus atque consequatur sit maiores
            exercitationem adipisci similique delectus voluptatum repellendus
            earum tempore, vero quia consequuntur odit assumenda!
          </Text>
        </>
      </BottomSheet>

      <View style={{ flex: 1 }} />

      {/* <Button
          type={ButtonType.TRANSPARENT}
          onPress={() => setESimSupport(false)}
        >
          <Text variant={TextVariant.Link} color={Color.PRIMARY}>
            I prefer a physical SIM. {">"}
          </Text>
        </Button> */}

      {/* {esimSupported && (
        <RectButton onPress={onContinue}>
          <Text variant={TextVariant.Description} color={Color.PRIMARY}>
            I prefer a physical SIM. {">"}
          </Text>
        </RectButton>
      )} */}

      <Button onPress={onContinue}>Continue</Button>
    </>
  );
}

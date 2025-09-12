import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import React from "react";

import { Color, Spacing } from "@/constants";

import Text, { TextVariant } from "./Text";
import AddressInput, { PartialAddress } from "./AddressInput";
import Button from "./Button";

interface Props {
  onContinue?: () => void;
  address: PartialAddress;
  setAddress: (address: PartialAddress) => void;
}

export default function ShippingAddressScreen({
  onContinue,
  address,
  setAddress,
}: Props) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: Spacing.SMALL,
          paddingBottom: Spacing.LARGE,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant={TextVariant.H3} color={Color.WHITE}>
          Your shipping address.
        </Text>

        <View style={{ marginVertical: Spacing.SMALL }}>
          <Text
            variant={TextVariant.BodyLarge}
            color={Color.WHITE}
            style={{ marginBottom: Spacing.MEDIUM }}
          >
            You’ll receive your SIM card within a few business days, free of
            charge.
          </Text>
          <Text variant={TextVariant.BodyLarge} color={Color.WHITE}>
            Please confirm your shipping address.
          </Text>
        </View>

        <AddressInput address={address} onChange={setAddress} showName />

        <View style={{ flex: 1 }} collapsable={false} />

        <Button
          enabled={!!address}
          // onPress={handlePSimDone}
          onPress={onContinue}
          style={{ marginTop: Spacing.LARGE }}
        >
          Continue
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

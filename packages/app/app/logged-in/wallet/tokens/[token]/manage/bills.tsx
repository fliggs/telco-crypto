import { Image, ScrollView, View } from "react-native";
import React, { useState } from "react";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";
import Text, { TextVariant } from "@/components/Text";
import { Color, Spacing } from "@/constants";
import { useLocalSearchParams } from "expo-router";
import { Params } from "..";
import { convert, formatCost } from "@/util";
import Button, { ButtonType } from "@/components/Button";
import CustomCheckbox from "@/components/CustomCheckBox";
import TextInput from "@/components/TextInput";

const bills = () => {
  const { token, name, image, price, balance, balanceInUsd } =
    useLocalSearchParams<Params>();
  const [amount, setAmount] = useState("");

  return (
    <SafeView dark>
      <Header showBack />

      <Text variant={TextVariant.H4} color={Color.WHITE}>
        Pay phone bills
      </Text>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, gap: Spacing.MEDIUM }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: Color.PRIMARY,
            paddingHorizontal: Spacing.MEDIUM,
            paddingVertical: Spacing.MEDIUM,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            minHeight: 48,
          }}
        >
          <Image
            source={{ uri: image }}
            resizeMode="contain"
            style={{
              alignSelf: "stretch",
              width: Spacing.LARGE,
              marginRight: Spacing.MEDIUM,
            }}
          />

          <View
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              marginRight: Spacing.SMALL,
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {name}
              </Text>
              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {balance} {token}
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                {token}
              </Text>
              <Text variant={TextVariant.Description} color={Color.BLACK}>
                {formatCost(balanceInUsd)}
              </Text>
            </View>
          </View>
        </View>

        <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
          How much of your {token} you'd like to allocate for settling your
          monthly bills.
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: Spacing.MEDIUM,
            marginVertical: Spacing.MEDIUM,
          }}
        >
          <View style={{ flex: 1 }}>
            <TextInput
              style={{ width: "100%" }}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter $ amount"
              textContentType="emailAddress"
              keyboardType="decimal-pad"
              autoCapitalize="none"
              autoCorrect={false}
              variant="secondary"
            />
            {amount !== "" && !isNaN(Number(amount)) && (
              <Text
                variant={TextVariant.Fineprint}
                style={{ marginLeft: Spacing.MEDIUM, marginTop: Spacing.SMALL }}
                color={Color.GRAY}
              >
                {convert(Number(amount), Number(price), "USD").toFixed(4)} SOL
              </Text>
            )}
          </View>

          <View style={{ flex: 1, marginTop: Spacing.MEDIUM }}>
            <CustomCheckbox
              text="Allocate all."
              checked={amount === balanceInUsd}
              onCheckedChange={() => setAmount(balanceInUsd)}
            />
          </View>
        </View>

        <Text
          variant={TextVariant.BodySmall}
          color={Color.WHITE}
          style={{ marginBottom: Spacing.SMALL }}
        >
          By confirming below, you authorize the transfer of funds from your
          wallet to mobile Inc. We will credit these funds towards your upcoming
          bills.
        </Text>
        <View
          style={{
            backgroundColor: Color.DARK,
            padding: Spacing.MEDIUM,
          }}
        >
          {" "}
          <View style={{ marginBottom: Spacing.SMALL }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: Spacing.MEDIUM,
              }}
            >
              <Text variant={TextVariant.H4} color={Color.WHITE}>
                Your credit bills
              </Text>
            </View>
            <View style={{ gap: Spacing.SMALL }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  Current balance
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  ${balanceInUsd}
                </Text>
              </View>

              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.PRIMARY}>
                  New allocation
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.PRIMARY}>
                  ${amount}
                </Text>
              </View>
            </View>
          </View>
          <View style={{ flex: 1, height: 1, backgroundColor: Color.WHITE }} />
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: Spacing.SMALL,
            }}
          >
            <Text variant={TextVariant.BodyMedium} color={Color.WHITE}>
              New bill credit balance
            </Text>
            <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
              $0
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Button type={ButtonType.PRIMARY} enabled={false}>
          <Text>{"Confirm"}</Text>
        </Button>
      </ScrollView>
    </SafeView>
  );
};

export default bills;

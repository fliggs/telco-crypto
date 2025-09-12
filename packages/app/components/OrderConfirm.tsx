import { View } from "react-native";
import { RectButton, ScrollView } from "react-native-gesture-handler";
import { useCallback, useEffect, useState } from "react";
import {
  PublicAddressDto,
  PublicOrderWithOfferDto,
  PublicTaxItemDto,
  SimType,
} from "api-client-ts";
import Decimal from "decimal.js";

import { Spacing, Color } from "@/constants";
import { useMe } from "@/providers/MeProvider";
import { useApi } from "@/providers/ApiProvider";
import { formatCost, getValidUntilDate } from "@/util";

import Text, { TextVariant } from "./Text";
import BottomSheet from "./BottomSheet";
import Button from "./Button";
import AccordionBlock from "./AccordionBlock";

interface Props {
  isLoading: boolean;
  order: PublicOrderWithOfferDto | null | undefined;
  taxes: PublicTaxItemDto[];
  address: PublicAddressDto | undefined;
  shippingAddress: PublicAddressDto | undefined;
  onChange: () => void;
  onDone: () => void;
}

export default function OrderConfirm({
  isLoading,
  order,
  taxes,
  address,
  shippingAddress,
  onChange,
  onDone,
}: Props) {
  const { settingsApi } = useApi();
  const { me } = useMe();
  const [show, setShow] = useState(false);
  const [terms, setTerms] = useState<string[]>([]);

  useEffect(() => {
    settingsApi.settingsGetTermsAndConditionsV1().then(setTerms);
  }, [settingsApi]);

  const getPlanDescription = useCallback(() => {
    const isAutoRenew = order?.offer?.plan.doesAutoRenew != null;
    const isESim = order?.simSelection?.simType === "E_SIM";
    const isPortIn = order?.portIn != null;

    if (isAutoRenew != null) {
      return "The plan will then renew automatically every 30 days and you can cancel anytime.";

      // : "Your SIM card will arrive in 3-5 business days. Once delivered your plan will activate and billing will start. The plan will renew automatically every 30 days and you can cancel anytime.";
    } else {
      return isESim && isPortIn
        ? "Your plan will activate and billing will begin once your number transfer is complete. The plan will then renew automatically every 30 days and you can cancel anytime."
        : // : "Your SIM card will arrive in 3-5 business days. Once delivered and your number transfer is complete, your plan will activate and billing will start. The plan will renew automatically every 30 days and you can cancel anytime.";
          "";
    }
  }, [order]);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        gap: Spacing.MEDIUM,
        paddingBottom: Spacing.MEDIUM,
      }}
    >
      {order?.offer && (
        <View
          style={{
            backgroundColor: Color.DARK,
            padding: Spacing.MEDIUM,
          }}
        >
          <View style={{ marginBottom: Spacing.LARGE }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text variant={TextVariant.H4} color={Color.WHITE}>
                {order.offer.plan.content.title ?? order.offer.plan.name}{" "}
                {order.offer.plan.isStandalone ? "plan" : "package"}
              </Text>
              <RectButton onPress={onChange}>
                <Text variant={TextVariant.Link}>Change {">"}</Text>
              </RectButton>
            </View>
            {order.offer.plan.isStandalone ? (
              <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                {order?.simSelection?.simType
                  ? order?.simSelection?.simType == "E_SIM"
                    ? "eSIM"
                    : "Physical SIM card"
                  : ""}
              </Text>
            ) : (
              <Text
                variant={TextVariant.Fineprint}
                color={Color.WHITE}
                style={{
                  paddingBottom: Spacing.SMALL,
                }}
              >
                Valid until{" "}
                {getValidUntilDate(order.offer.plan.validForSeconds)}
              </Text>
            )}
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {order.offer.plan.doesAutoRenew ? (
              <Text variant={TextVariant.Description} color={Color.WHITE}>
                Mobile plan
              </Text>
            ) : (
              <Text variant={TextVariant.Description} color={Color.WHITE}>
                Data booster
              </Text>
            )}
            <Text variant={TextVariant.Description} color={Color.WHITE}>
              {formatCost(order.offer.originalCost ?? order.offer.cost)}
            </Text>
          </View>

          {order.offer.originalCost &&
            order.offer.originalCost !== order.offer.cost && (
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: Spacing.SMALL,
                }}
              >
                {order.offer.plan.doesAutoRenew ? (
                  <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    Permanent discount
                  </Text>
                ) : (
                  <Text variant={TextVariant.Description} color={Color.WHITE}>
                    Discount
                  </Text>
                )}
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  {formatCost(
                    Decimal(order.offer.cost).minus(
                      Decimal(order.offer.originalCost)
                    )
                  )}
                </Text>
              </View>
            )}

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: Spacing.SMALL,
              paddingTop: Spacing.SMALL,
              borderTopColor: "white",
              borderTopWidth: 1,
            }}
          >
            {order.offer.plan.doesAutoRenew ? (
              <Text variant={TextVariant.Description} color={Color.WHITE}>
                Monthly service
              </Text>
            ) : (
              <Text variant={TextVariant.Description} color={Color.WHITE}>
                One-time service
              </Text>
            )}
            <Text variant={TextVariant.Description} color={Color.WHITE}>
              {formatCost(order.offer.cost)}
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              marginTop: Spacing.MEDIUM,
              justifyContent: "space-between",
            }}
          >
            <BottomSheet
              trigger={(show) => (
                <RectButton onPress={show}>
                  <Text variant={TextVariant.Link}>Taxes and Fees {">"}</Text>
                </RectButton>
              )}
            >
              <Text variant={TextVariant.H3} color={Color.BLACK}>
                Taxes and Fees
              </Text>

              <View
                style={{
                  display: "flex",
                  alignSelf: "stretch",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: Spacing.MEDIUM,
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                  Taxes and Surcharges
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                  {taxes
                    .filter((t) => t.tags.includes("tax"))
                    .reduce((acc, t) => acc + Number(t.cost), 0)
                    .toFixed(2)}
                </Text>
              </View>

              <View style={{ alignSelf: "stretch", alignItems: "stretch" }}>
                {taxes
                  .filter((t) => t.tags.includes("tax"))
                  .map((tax) => (
                    <View
                      key={tax.id}
                      style={{
                        display: "flex",
                        alignSelf: "stretch",
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                        {tax.title}
                      </Text>
                      <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                        {Number(tax.cost).toFixed(2)}
                      </Text>
                    </View>
                  ))}
              </View>

              {taxes.some((t) => t.tags.includes("fee")) && (
                <>
                  <View
                    style={{
                      display: "flex",
                      alignSelf: "stretch",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: Spacing.SMALL,
                    }}
                  >
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      Fees
                    </Text>
                    <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
                      {taxes
                        .filter((t) => t.tags.includes("fee"))
                        .reduce((acc, t) => acc + Number(t.cost), 0)
                        .toFixed(2)}
                    </Text>
                  </View>

                  <View style={{ alignSelf: "stretch", alignItems: "stretch" }}>
                    {taxes
                      .filter((t) => t.tags.includes("fee"))
                      .map((tax) => (
                        <View
                          key={tax.id}
                          style={{
                            display: "flex",
                            alignSelf: "stretch",
                            flexDirection: "row",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text
                            variant={TextVariant.BodySmall}
                            color={Color.BLACK}
                          >
                            {tax.title}
                          </Text>
                          <Text
                            variant={TextVariant.BodySmall}
                            color={Color.BLACK}
                          >
                            {Number(tax.cost).toFixed(2)}
                          </Text>
                        </View>
                      ))}
                  </View>
                </>
              )}
            </BottomSheet>

            <Text color={Color.WHITE}>
              {formatCost(
                taxes.reduce(
                  (total, tax) => total.plus(tax.cost),
                  new Decimal(0)
                )
              )}
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: Spacing.MEDIUM,
              paddingTop: Spacing.SMALL,
              borderTopColor: "white",
              borderTopWidth: 1,
            }}
          >
            {order.offer.plan.doesAutoRenew ? (
              <Text variant={TextVariant.Description} color={Color.WHITE}>
                Total per month
              </Text>
            ) : (
              <Text variant={TextVariant.Description} color={Color.WHITE}>
                Total
              </Text>
            )}
            <Text variant={TextVariant.Description} color={Color.WHITE}>
              {formatCost(
                Decimal(order.offer.cost).plus(
                  taxes.reduce((total, tax) => total.plus(tax.cost), Decimal(0))
                )
              )}
            </Text>
          </View>
          {order.offer.plan.isStandalone && address ? (
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginTop: Spacing.LARGE,
              }}
            >
              <Text
                variant={TextVariant.Description}
                color={Color.WHITE}
                style={{ marginBottom: Spacing.SMALL }}
              >
                Principal address
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  {address.name
                    ? address.name
                    : me.lastName + ", " + me.firstName}
                </Text>
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  {address.line1}
                </Text>
                {address.line2 && (
                  <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    {address.line2}
                  </Text>
                )}
                {address.line3 && (
                  <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    {address.line3}
                  </Text>
                )}
                {address.line4 && (
                  <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                    {address.line4}
                  </Text>
                )}
                <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                  {address.postalCode} {address.city}, {address.province}
                </Text>
              </View>

              {order?.simSelection?.simType === SimType.PSim &&
                !order.simSelection.iccid &&
                shippingAddress && (
                  <>
                    <Text
                      variant={TextVariant.Description}
                      color={Color.WHITE}
                      style={{
                        marginBottom: Spacing.SMALL,
                        marginTop: Spacing.MEDIUM,
                      }}
                    >
                      Shipping address
                    </Text>
                    <View
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        width: "100%",
                      }}
                    >
                      <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                        {shippingAddress.name
                          ? shippingAddress.name
                          : me.lastName + ", " + me.firstName}
                      </Text>
                      <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                        {shippingAddress.line1}
                      </Text>

                      {shippingAddress.line2 && (
                        <Text
                          variant={TextVariant.BodySmall}
                          color={Color.WHITE}
                        >
                          {shippingAddress.line2}
                        </Text>
                      )}
                      {shippingAddress.line3 && (
                        <Text
                          variant={TextVariant.BodySmall}
                          color={Color.WHITE}
                        >
                          {shippingAddress.line3}
                        </Text>
                      )}
                      {shippingAddress.line4 && (
                        <Text
                          variant={TextVariant.BodySmall}
                          color={Color.WHITE}
                        >
                          {shippingAddress.line4}
                        </Text>
                      )}
                      <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                        {shippingAddress.postalCode} {shippingAddress.city},{" "}
                        {shippingAddress.province}
                      </Text>
                    </View>
                  </>
                )}
            </View>
          ) : (
            <View
              style={{
                marginTop: Spacing.LARGE,
              }}
            >
              <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                Your data booster will be active immediately after purchase and
                valid until the end of your current bill cycle.
              </Text>
            </View>
          )}

          <View
            style={{
              marginTop: Spacing.MEDIUM,
            }}
          >
            {order?.offer?.plan.isStandalone && (
              <Text variant={TextVariant.BodySmall} color={Color.WHITE}>
                {getPlanDescription()}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={{ flex: 1 }} />

      {order?.offer?.plan.isStandalone && (
        <AccordionBlock
          data={{ title: "Crypto rewards" }}
          show={show}
          onShow={() => setShow(true)}
          onClose={() => setShow(false)}
        />
      )}

      <BottomSheet
        trigger={(show) => (
          <RectButton onPress={show}>
            <Text color={Color.WHITE}>By continuing you accept our </Text>
            <Text variant={TextVariant.Link}>Terms and conditions {">"}</Text>
          </RectButton>
        )}
      >
        <Text variant={TextVariant.H3} color={Color.BLACK}>
          Terms and conditions
        </Text>

        {terms.map((term, i) => (
          <Text key={i} color={Color.BLACK}>
            {term}
          </Text>
        ))}
      </BottomSheet>

      <Button onPress={onDone} enabled={!isLoading && taxes.length > 0}>
        Confirm
      </Button>
    </ScrollView>
  );
}

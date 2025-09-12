import { ScrollView, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddressType } from "api-client-ts";
import { useTranslation } from "@/node_modules/react-i18next";
import { Color, Spacing } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import Header from "@/components/Header";
import SafeView from "@/components/SafeView";
import Button from "@/components/Button";
import Text, { TextVariant } from "@/components/Text";
import AddressInput, { PartialAddress } from "@/components/AddressInput";
import { isAddressEqual } from "@/util";
import BottomSheet from "@/components/BottomSheet";
import Warning from "@/components/Warning";

export default function s() {
  const { meApi } = useApi();
  const { showError } = useErrorSheet();
  const { t } = useTranslation();
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [address, setAddress] = useState<PartialAddress>({
    name: "",
    line1: "",
    line2: "",
    line3: "",
    line4: "",
    city: "",
    postalCode: "",
    province: "",
    country: "",
  });
  const [shippingAddress, setShippingAddress] = useState<PartialAddress>({
    name: "",
    line1: "",
    line2: "",
    line3: "",
    line4: "",
    city: "",
    postalCode: "",
    province: "",
    country: "",
  });
  const [hasShipping, sethasShipping] = useState(false);
  const [initialAddress, setInitialAddress] = useState<PartialAddress | null>(
    null
  );
  const [bottomSheetContentType, setBottomSheetContentType] = useState<
    "changed" | "confirm"
  >("confirm");

  useEffect(() => {
    meApi.meFindMyAddressesV1().then((addrs) => {
      const billingAddr = addrs.find((a) => a.type === AddressType.Billing);
      const shippingAddr = addrs.find((a) => a.type === AddressType.Shipping);
      if (billingAddr) {
        setAddress(billingAddr);
        setInitialAddress(billingAddr);
      }
      if (shippingAddr) {
        setShippingAddress(shippingAddr);
        sethasShipping(true);
      }
    });
  }, [meApi]);

  const isModified = useMemo(() => {
    return initialAddress !== null && !isAddressEqual(address, initialAddress);
  }, [address, initialAddress]);

  const handleSave = useCallback(async () => {
    try {
      await meApi.meChangeMyAddressV1({
        type: AddressType.Billing,
        changeMyAddressDto: address,
      });
    } catch (err) {
      showError({
        error: err,
      });
    }
  }, [meApi, address]);

  return (
    <SafeView gap={Spacing.SMALL} dark>
      <Header showBack />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: Spacing.SMALL,
          paddingBottom: Spacing.MEDIUM,
        }}
      >
        <Text
          variant={TextVariant.H4}
          color={Color.WHITE}
          style={{ marginBottom: Spacing.MEDIUM }}
        >
          Primary address.
        </Text>

        <Text
          variant={TextVariant.BodySmall}
          color={Color.WHITE}
          style={{ marginBottom: Spacing.MEDIUM }}
        >
          You can update your address at any time. For security reasons, no
          changes to the SIM card will be possible during 30 days following the
          address update.
        </Text>
        <AddressInput
          address={address}
          onChange={setAddress}
          triggerValidation={triggerValidation}
          onErrorChange={setHasErrors}
        />

        <View style={{ flex: 1 }} />

        {isModified && (
          <BottomSheet
            trigger={(show) => (
              <Button onPress={show}>{t("global.button-confirm")}</Button>
            )}
            imageSuccess={bottomSheetContentType === "changed"}
          >
            {bottomSheetContentType === "changed"
              ? (close) => (
                  <View
                    style={{
                      gap: Spacing.SMALL,
                      paddingVertical: Spacing.SMALL,
                      display: "flex",
                      justifyContent: "center",
                      width: "95%",
                    }}
                  >
                    <Text
                      variant={TextVariant.H4}
                      color={Color.BLACK}
                      style={{
                        flexWrap: "wrap",
                        flexShrink: 1,
                        marginBottom: Spacing.SMALL,
                      }}
                    >
                      {t("account.address-settings-changed")}
                    </Text>

                    <Text variant={TextVariant.BodyMedium} color={Color.BLACK}>
                      {t("account.address-settings-description")}
                    </Text>
                    <Button
                      style={{
                        marginTop: Spacing.SMALL,
                        width: "100%",
                        alignSelf: "stretch",
                      }}
                      onPress={close}
                    >
                      {t("global.button-ok")}
                    </Button>
                  </View>
                )
              : (close) => (
                  <View
                    style={{
                      gap: Spacing.SMALL,
                      paddingVertical: Spacing.SMALL,
                      display: "flex",
                      justifyContent: "center",
                      width: "95%",
                    }}
                  >
                    <Warning color={Color.RED} />
                    <Text variant={TextVariant.H4} color={Color.BLACK}>
                      {t("account.confirm-address-change")}
                    </Text>
                    <Text
                      variant={TextVariant.BodySmall}
                      color={Color.BLACK}
                      style={{ marginVertical: Spacing.MEDIUM }}
                    >
                      {t("account.address-settings-confirm-description")}
                    </Text>

                    <View
                      style={{ marginTop: Spacing.MEDIUM, gap: Spacing.SMALL }}
                    >
                      <Button
                        onPress={() => {
                          handleSave().then(() =>
                            setBottomSheetContentType("changed")
                          );
                        }}
                      >
                        {t("global.button-continue")}
                      </Button>
                    </View>
                  </View>
                )}
          </BottomSheet>
        )}

        {hasShipping && (
          <View style={{ marginTop: Spacing.LARGE }}>
            <Text
              variant={TextVariant.H4}
              color={Color.WHITE}
              style={{ marginBottom: Spacing.MEDIUM }}
            >
              Shipping address.
            </Text>

            <Text
              variant={TextVariant.BodySmall}
              color={Color.WHITE}
              style={{ marginBottom: Spacing.MEDIUM }}
            >
              Used for your SIM card order.
            </Text>

            <AddressInput
              address={shippingAddress}
              onChange={setShippingAddress}
            />
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
}

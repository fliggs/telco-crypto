import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { AddressType, SimType } from "api-client-ts";

import { PartialAddress } from "@/components/AddressInput";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useApi } from "@/providers/ApiProvider";
import { useMe } from "@/providers/MeProvider";
import { useOrder } from "@/providers/OrderProvider";
import ShippingAddressScreen from "@/components/ShippingAddressScreen";
import SafeView from "@/components/SafeView";
import Header from "@/components/Header";

export default function NewOrderSimTypeShipping() {
  const { meApi } = useApi();
  const { me } = useMe();
  const { showError } = useErrorSheet();
  const { order, update } = useOrder();
  const [address, setAddress] = useState<PartialAddress>({
    name: "",
    line1: "",
    line2: "",
    line3: "",
    line4: "",
    postalCode: "",
    city: "",
    province: "",
    country: "",
  });

  useEffect(() => {
    meApi
      .meFindMyAddressV1({ type: AddressType.Shipping })
      .then(setAddress)
      .catch(() =>
        meApi
          .meFindMyAddressV1({ type: AddressType.Billing })
          .then((addr) =>
            setAddress({ ...addr, name: `${me.firstName} ${me.lastName}` })
          )
          .catch(console.error)
      );
  }, [meApi, me]);

  const handlePSimDone = useCallback(async () => {
    if (!address || !order) {
      return;
    }

    try {
      await meApi.meChangeMyAddressV1({
        type: AddressType.Shipping,
        changeMyAddressDto: address,
      });
      await update({ simSelection: { simType: SimType.PSim } });
      router.push({
        pathname: "/logged-in/orders/[orderId]/confirm",
        params: { orderId: order.id },
      });
    } catch (err) {
      showError({ error: err });
    }
  }, [meApi, update, order, address]);

  return (
    <SafeView dark>
      <Header showBack />

      <ShippingAddressScreen
        onContinue={handlePSimDone}
        setAddress={setAddress}
        address={address}
      />
    </SafeView>
  );
}

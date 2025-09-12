import { useCallback, useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { AddressType, SimType } from "api-client-ts";

import { PartialAddress } from "@/components/AddressInput";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useApi } from "@/providers/ApiProvider";
import { useCurrentOrder } from "@/providers/CurrentOrderProvider";
import ShippingAddressScreen from "@/components/ShippingAddressScreen";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";
import { useMe } from "@/providers/MeProvider";

export default function OnboardingSimTypeShipping() {
  const { meApi } = useApi();
  const { me } = useMe();
  const { showError } = useErrorSheet();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { update } = useCurrentOrder();
  const { completeStage } = useOnboardingProgress();
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
    if (!address) {
      return;
    }

    try {
      await meApi.meChangeMyAddressV1({
        type: AddressType.Shipping,
        changeMyAddressDto: address,
      });
      await update({ simSelection: { simType: SimType.PSim } });
      await completeStage(stage);
    } catch (err) {
      showError({ error: err });
    }
  }, [meApi, update, completeStage, stage, address]);

  return (
    <SafeView dark>
      <OnboardingHeader />

      <ShippingAddressScreen
        onContinue={handlePSimDone}
        setAddress={setAddress}
        address={address}
      />
    </SafeView>
  );
}

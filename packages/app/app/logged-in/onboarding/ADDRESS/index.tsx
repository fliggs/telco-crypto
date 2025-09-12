import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Linking, View } from "react-native";
import { OnboardingDataAddressDto, PublicCoverageDto } from "api-client-ts";
import {
  Pressable,
  RectButton,
  ScrollView,
} from "react-native-gesture-handler";

import { Color, Spacing } from "@/constants";
import { coverageToWords, logError } from "@/util";
import { useApi } from "@/providers/ApiProvider";
import { useErrorSheet } from "@/providers/ErrorSheetProvider";
import { useSupport } from "@/providers/SupportProvider";
import { useOnboardingProgress } from "@/providers/OnboardingProgressProvider";
import { useOnboardingStages } from "@/providers/OnboardingStagesProvider";
import AddressInput, { PartialAddress } from "@/components/AddressInput";
import Button, { ButtonType } from "@/components/Button";
import ProgressBar from "@/components/ProgressBar";
import Text, { TextVariant } from "@/components/Text";
import { useTranslation } from "@/node_modules/react-i18next";
import SafeView from "@/components/SafeView";
import OnboardingHeader from "@/components/OnboardingHeader";
import TMobileWebContent from "@/components/TmobileWebContent";

const INTERVALS = [0, 0.25, 0.5, 0.75, 1];
const COVERAGE_MAP_LINK = "https://www.t-mobile.com/coverage/coverage-map";

export default function OnboardingAddress() {
  const { t } = useTranslation();
  const { stage } = useLocalSearchParams<{ stage: string }>();
  const { startStage, completeStage } = useOnboardingProgress();
  const { requiredStages } = useOnboardingStages();
  const { showError } = useErrorSheet();
  const { showChat } = useSupport();
  const { meApi, telcoApi } = useApi();
  const [address, setAddress] = useState<PartialAddress>({
    name: null,
    line1: "",
    line2: "",
    line3: "",
    line4: "",
    postalCode: "",

    city: "",
    province: "",
    country: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [coverageLoading, setCoverageLoading] = useState(false);
  const [{ coverage }, setCoverage] = useState<PublicCoverageDto>({
    coverage: null,
  });
  const [triggerValidation, setTriggerValidation] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [showCoverage, setShowCoverage] = useState(false);

  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const currentStage = useMemo(
    () => requiredStages.find((s) => s.name === stage),
    [requiredStages, stage]
  );
  const stageData = useMemo(
    () => currentStage?.data as OnboardingDataAddressDto,
    [currentStage]
  );
  const { postalCode, province, city, line1 } = address;

  const isFormValid =
    postalCode?.trim() !== "" &&
    province?.trim() !== "" &&
    city?.trim() !== "" &&
    line1?.trim() !== "";

  useEffect(() => {
    startStage(stage);
  }, [startStage, stage]);

  useEffect(() => {
    meApi.meFindMyAddressesV1().then((addrs) => {
      const newAddr = addrs.find((a) => a.type === stageData.addressType);
      if (newAddr) {
        setAddress(newAddr);
      }
    });
  }, []);

  useEffect(() => {
    setCoverageLoading(true);
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = undefined;
    }

    const addr = address;

    if (!addr.line1 || !addr.postalCode || !addr.city) {
      setCoverageLoading(false);
      return;
    }

    timeout.current = setTimeout(() => {
      telcoApi
        .telcoCheckCoverageV1({ checkCoverageDto: addr })
        .then(setCoverage)
        .catch(logError)
        .finally(() => {
          setCoverageLoading(false);
          timeout.current = undefined;
        });
    }, 500);
  }, [address]);

  const handleDone = useCallback(async () => {
    if (isLoading) return;

    setTriggerValidation(true);

    setTimeout(() => {
      if (hasErrors || !isFormValid) return;
      setIsLoading(true);

      meApi
        .meChangeMyAddressV1({
          type: stageData.addressType,
          changeMyAddressDto: address,
        })
        .then(() => completeStage(stage))
        .catch((err) => showError({ error: err }))
        .finally(() => setIsLoading(false));
    }, 50);
  }, [address, isFormValid, hasErrors, isLoading]);
  // const streetNumber = '235';
  // const street = '9th Ave';
  // const encity = 'New York City';
  // const zip = '10001';

  // const fullAddress = `${streetNumber},${street},${encity},${zip}`;
  // const encodedAddress = encodeURIComponent(fullAddress);

  // Result: '235%2C9th%20Ave%2CNew%20York%20City%2C10001'
  const encodedAddress = useMemo(() => {
    const { line1, city, postalCode } = address;

    if (!line1 || !city || !postalCode) return "";

    const full = `${line1},${city},${postalCode}`;
    return encodeURIComponent(full);
  }, [address]);

  return (
    <SafeView dark>
      <OnboardingHeader />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, gap: Spacing.MEDIUM }}
        keyboardShouldPersistTaps="handled"
      >
        {!showCoverage ? (
          <>
            <Text variant={TextVariant.H3} color={Color.WHITE}>
              {t("onboarding.enter-your-address")}
            </Text>

            <AddressInput
              address={address}
              onChange={setAddress}
              triggerValidation={triggerValidation}
              onErrorChange={setHasErrors}
            />

            <View style={{ gap: Spacing.SMALL, marginTop: Spacing.MEDIUM }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text color={Color.WHITE}>
                  {t("onboarding.your-coverage-is")}
                </Text>
                <Text variant={TextVariant.H4} color={Color.WHITE}>
                  {coverageLoading ? "..." : coverageToWords(coverage)}
                </Text>
              </View>

              <ProgressBar
                value={INTERVALS.findLastIndex((val) => val <= (coverage ?? 0))}
                max={INTERVALS.length}
              />

              <Pressable onPress={() => setShowCoverage(true)}>
                <Text variant={TextVariant.Link}>
                  {t("onboarding.check-coverage-map")} {">"}
                </Text>
              </Pressable>
            </View>

            <View style={{ flexGrow: 1 }} collapsable={false} />

            <View style={{ gap: Spacing.SMALL }}>
              <RectButton onPress={showChat}>
                <Text variant={TextVariant.Link}>
                  {t("global.live-chat-support")} {">"}
                </Text>
              </RectButton>

              <Button
                enabled={!isLoading && isFormValid && !hasErrors}
                onPress={handleDone}
                type={ButtonType.PRIMARY}
              >
                {t("global.button-continue")}
              </Button>
            </View>
          </>
        ) : (
          <View style={{ width: "100%", height: "100%" }}>
            <TMobileWebContent
              setShowCoverage={setShowCoverage}
              zipCode={address.postalCode ?? ""}
              encodedAddress={encodedAddress}
            />
          </View>
        )}
      </ScrollView>
    </SafeView>
  );
}

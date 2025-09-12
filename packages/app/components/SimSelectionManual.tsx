import { FlatList, StyleSheet, View } from "react-native";
import React, { useCallback, useState } from "react";
import { RectButton } from "react-native-gesture-handler";
import { PublicDeviceDto } from "api-client-ts";

import { Color, Spacing } from "@/constants";
import { useApi } from "@/providers/ApiProvider";
import { get, set } from "@/storage";

import Text, { TextVariant } from "./Text";
import SelectableCard, { CardVariant } from "./SelectableCard";
import Button, { ButtonType } from "./Button";
import BottomSheet from "./BottomSheet";
import SearchInput from "./SearchInput";
import { t } from "i18next";

interface Props {
  onContinue: (supported: boolean) => void;
}

export default function SimSelectionManual({ onContinue }: Props) {
  const { settingsApi } = useApi();
  const [search, setSearch] = useState("");
  const [devices, setDevices] = useState<PublicDeviceDto[]>([]);
  const [eSimSupported, setESimSupported] = useState<boolean>();

  const filteredData = devices?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  // useEffect(() => {
  //   settingsApi.settingsGetSupportedDevicesV1().then(setDevices);
  // }, [settingsApi]);

  const fetchDevices = async () => {
    try {
      const cached = get<{ timestamp: number; data: PublicDeviceDto[] }>(
        "cached_devices"
      );

      if (cached && Date.now() - cached.timestamp < 86400000) {
        setDevices(cached.data);
      } else {
        console.log("Calling settingsGetSupportedDevicesV1");
        const data = await settingsApi.settingsGetSupportedDevicesV1();
        setDevices(data);
        set("cached_devices", { timestamp: Date.now(), data });
      }
    } catch (e) {
      console.error("Failed to fetch devices:", e);
    }
  };

  const onPress = useCallback(() => {
    if (typeof eSimSupported === "undefined") {
      return;
    }

    onContinue(eSimSupported);
  }, [onContinue, eSimSupported]);

  return (
    <>
      <Text variant={TextVariant.H3} color={Color.WHITE}>
        Select your SIM.
      </Text>

      <Text
        color={Color.WHITE}
        style={{ marginBottom: Spacing.SMALL }}
        variant={TextVariant.BodyLarge}
      >
        Is your phone eSIM compatible?
      </Text>

      <View style={{ gap: Spacing.SMALL }}>
        <SelectableCard
          title="Yes"
          variant={CardVariant.SECONDARY}
          description={t("onboarding.esim-description")}
          selected={eSimSupported === true}
          onPress={() => setESimSupported(true)}
        />
        <SelectableCard
          title="No"
          variant={CardVariant.SECONDARY}
          selected={eSimSupported === false}
          onPress={() => setESimSupported(false)}
          description={t("onboarding.psim-description")}
        />
      </View>
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
            An eSIM is a digital SIM card that is installed on your phone,
            allowing you to connect to a mobile network without a physical SIM
            card. After purchasing a plan, you can install and activate your
            eSIM in just a few clicks or by scanning a QR code, enabling instant
            use for calls, texts, and data.
          </Text>
        </>
      </BottomSheet>

      <View style={{ flex: 1 }} collapsable={false} />

      <BottomSheet
        trigger={(show) => (
          <Button
            type={ButtonType.DARK}
            textVariant={TextVariant.H4}
            onPress={() => {
              show();
              fetchDevices();
            }}
          >
            Compatible devices {">"}
          </Button>
        )}
      >
        <View style={{ paddingHorizontal: Spacing.SMALL, gap: Spacing.SMALL }}>
          <Text
            variant={TextVariant.H4}
            color={Color.BLACK}
            style={{ marginBottom: Spacing.SMALL }}
          >
            Compatible devices.
          </Text>
          <Text variant={TextVariant.BodySmall} color={Color.BLACK}>
            Smart and the latest Apple and Android devices are eSIM compatible.
          </Text>
          <BottomSheet
            trigger={(show) => (
              <RectButton onPress={show}>
                <Text variant={TextVariant.Description} color={Color.DARK}>
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
                An eSIM is a digital SIM card that is installed on your phone,
                allowing you to connect to a mobile network without a physical
                SIM card. After purchasing a plan, you can install and activate
                your eSIM in just a few clicks or by scanning a QR code,
                enabling instant use for calls, texts, and data.
              </Text>
            </>
          </BottomSheet>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search"
          />

          <FlatList
            scrollEnabled={false}
            data={filteredData}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text variant={TextVariant.Description} color={Color.BLACK}>
                  {item?.type == "ios"
                    ? "Apple"
                    : item?.type == "android"
                      ? "Android"
                      : ""}
                </Text>
                <Text variant={TextVariant.BodyMedium} color={Color.BLACK}>
                  {item.name}
                </Text>
              </View>
            )}
          />
        </View>
      </BottomSheet>

      <Button onPress={onPress} enabled={typeof eSimSupported !== "undefined"}>
        Continue
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.MEDIUM,
    backgroundColor: "#fff",
    flex: 1,
  },
  searchBar: {
    position: "relative",
    marginBottom: Spacing.LARGE,
  },
  inputContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  searchIcon: {
    position: "absolute",
    right: 16,
    top: 18,
    opacity: 0.5,
  },
  item: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "bold",
  },
});

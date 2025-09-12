import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Color, Spacing } from "@/constants";
import { useSharedValue, withTiming } from "react-native-reanimated";
import { PublicAddressDto } from "api-client-ts";

import TextInput from "./TextInput";
import Text, { TextVariant } from "./Text";
import SelectInput from "./StateSelectInput";
import { Pressable } from "react-native-gesture-handler";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY ?? "";

export interface PlaceDetails {
  addressComponents: AddressComponent[];
}

export interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

export type PartialAddress = Omit<PublicAddressDto, "id" | "type">;

interface Props {
  address: PartialAddress;
  onChange: (address: PartialAddress) => void;
  showName?: boolean;
  triggerValidation?: boolean;
  onErrorChange?: (hasErrors: boolean) => void;
}

const AddressInput: FC<Props> = ({
  address,
  onChange,
  showName,
  triggerValidation,
  onErrorChange,
}) => {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  const bottom = useSharedValue(4);
  const textSize = useSharedValue(TextVariant.BodyMedium);
  const [suggestions, setSuggestions] = useState<[string, string][]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const name = "";

  useEffect(() => {
    const hasValue = text.length > 0;
    if (focused || hasValue) {
      bottom.value = withTiming(36, { duration: 200 });
      textSize.value = withTiming(TextVariant.BodySmall, { duration: 200 });
    } else {
      bottom.value = withTiming(4, { duration: 200 });
      textSize.value = withTiming(TextVariant.BodySmall, { duration: 200 });
    }
  }, [focused, text]);

  const onChangeStreet = useCallback(
    async (street: string) => {
      onChange({ ...address, line1: street });
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }

      timer.current = setTimeout(async () => {
        timer.current = null;

        try {
          const res = await fetch(
            "https://places.googleapis.com/v1/places:autocomplete",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": GOOGLE_API_KEY,
                "X-Goog-FieldMask":
                  "suggestions.placePrediction.text.text,suggestions.placePrediction.placeId",
              },
              body: JSON.stringify({
                input: street,
                includedPrimaryTypes: ["street_address"],
                includedRegionCodes: ["us"],
                languageCode: "en",
              }),
            }
          );
          const resBody = await res.text();
          const resJson = JSON.parse(resBody);
          setSuggestions(
            resJson.suggestions.map((s: any) => [
              s.placePrediction.placeId,
              s.placePrediction.text.text,
            ])
          );
        } catch (err) {
          console.log(err);
          setSuggestions([]);
        }
      }, 500);
    },
    [onChange, address]
  );

  const setAddress = useCallback(async (placeId: string) => {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "addressComponents",
        },
      }
    );
    const resBody = await res.text();
    const resJson: PlaceDetails = JSON.parse(resBody);

    const nr =
      resJson.addressComponents.find((c) => c.types.includes("street_number"))
        ?.longText ?? "";
    const street =
      resJson.addressComponents.find((c) => c.types.includes("route"))
        ?.longText ?? "";
    const postalCode =
      resJson.addressComponents.find((c) => c.types.includes("postal_code"))
        ?.longText ?? "";
    const city =
      resJson.addressComponents.find((c) => c.types.includes("locality"))
        ?.longText ?? "";
    const province =
      resJson.addressComponents.find((c) =>
        c.types.includes("administrative_area_level_1")
      )?.longText ?? "";
    const country =
      resJson.addressComponents.find((c) => c.types.includes("country"))
        ?.longText ?? "";
    const addr: PartialAddress = {
      name: null,
      line1: `${nr} ${street}`,
      line2: "",
      line3: "",
      line4: "",
      city,
      country,
      postalCode,
      province,
    };
    onChange(addr);
    setSuggestions([]);
  }, []);

  useEffect(() => {
    if (triggerValidation) {
      const errorsExist =
        !address.line1?.trim() ||
        !address.postalCode?.trim() ||
        !address.city?.trim();

      onErrorChange?.(errorsExist);
    }
  }, [address, triggerValidation]);

  return (
    <>
      <View style={{ gap: Spacing.SMALL }}>
        {showName && (
          <>
            <TextInput
              isRequired
              value={address.name ?? ""}
              placeholder="Name"
              onChangeText={(txt) => onChange({ ...address, name: txt })}
              variant="secondary"
              containerStyle={{ flex: 2 }}
            />
          </>
        )}

        <TextInput
          value={address.line1}
          placeholder="Street address"
          onChangeText={onChangeStreet}
          variant="secondary"
          isRequired
          triggerValidation
        />

        {suggestions.length > 0 && (
          <View
            style={{
              marginTop: -Spacing.SMALL,
              flexDirection: "column",
              backgroundColor: Color.DARK_GRAY,
              gap: 1,
              paddingTop: 1,
            }}
          >
            {suggestions.map(([id, label]) => (
              <Pressable key={id} onPress={() => setAddress(id)}>
                <Text
                  style={{
                    padding: Spacing.SMALL,
                    backgroundColor: Color.DARK,
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
            <View
              style={{
                flexDirection: "row-reverse",
                padding: Spacing.SMALL,
                backgroundColor: Color.DARK,
              }}
            >
              <Image
                source={require("@/assets/images/google_on_non_white.png")}
                style={{}}
              />
            </View>
          </View>
        )}

        <View style={{ position: "relative" }}>
          <Text
            style={{
              position: "absolute",
              top: 2,
              right: 16,
              fontSize: 12,
              color: Color.GRAY,
              zIndex: 1,
            }}
          >
            *optional
          </Text>

          <TextInput
            value={address.line2}
            placeholder="Apartment, suite, ..."
            onChangeText={(txt) => onChange({ ...address, line2: txt })}
            variant="secondary"
          />
        </View>

        <View style={{ flexDirection: "row", gap: Spacing.SMALL }}>
          <TextInput
            isRequired
            value={address.postalCode}
            placeholder="ZIP"
            onChangeText={(txt) => onChange({ ...address, postalCode: txt })}
            variant="secondary"
            containerStyle={{ flex: 2 }}
            onlyNumbers
            triggerValidation
          />
          <TextInput
            isRequired
            value={address.city}
            placeholder="City / Town"
            onChangeText={(txt) => onChange({ ...address, city: txt })}
            variant="secondary"
            containerStyle={{ flex: 3 }}
            triggerValidation
          />
        </View>

        <SelectInput
          value={address.province}
          label="State"
          onSelect={(txt) => onChange({ ...address, province: txt })}
        />
      </View>
    </>
  );
};

export default AddressInput;

const styles = StyleSheet.create({
  container: {
    position: "relative",
    backgroundColor: Color.DARK,
    flexDirection: "column",
    justifyContent: "center",
    marginBottom: Spacing.MEDIUM,
  },
});

import React, { useMemo, useState } from "react";
import { TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";

import { Color, Spacing } from "@/constants";

import Text, { TextVariant } from "./Text";
import TextInput from "./TextInput";

const STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const SelectInput = ({
  value,
  onSelect,
  label = "State",
}: {
  value: string;
  onSelect: (val: string) => void;
  label?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredStates = useMemo(() => {
    if (!value) return [];
    return STATES.filter((state) =>
      state.toLowerCase().includes(value.toLowerCase())
    );
  }, [value]);

  const handleSelect = (item: string) => {
    onSelect(item);
    setShowDropdown(false);
  };

  return (
    <View style={{ zIndex: 10 }}>
      <TextInput
        value={value}
        onChangeText={(txt) => {
          onSelect(txt);
          setShowDropdown(true);
        }}
        placeholder={label}
        placeholderTextColor={Color.GRAY}
        variant="secondary"
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && filteredStates.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView
            style={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {filteredStates.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.option}
                onPress={() => handleSelect(item)}
              >
                <Text
                  variant={TextVariant.BodySmall}
                  color={Color.WHITE}
                  style={{ marginBottom: Spacing.SMALL }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  selectBox: {
    backgroundColor: Color.DARK,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollContainer: {
    maxHeight: 200,
  },
  selectText: {
    fontSize: 16,
    color: Color.WHITE,
  },
  dropdown: {
    backgroundColor: Color.DARK,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: Color.WHITE,
  },
  input: {
    backgroundColor: Color.DARK,
    color: Color.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderRadius: 4,
  },
});

export default SelectInput;

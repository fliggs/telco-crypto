import React from "react";
import { View, StyleSheet, TextInput as RNTextInput, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Spacing } from "@/constants";

interface SearchInputProps extends TextInputProps {
  containerStyle?: object;
}

const SearchInput: React.FC<SearchInputProps> = ({ containerStyle, style, ...props }) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <RNTextInput
        placeholder="Search"
        placeholderTextColor="#999"
        style={[styles.input, style]}
        {...props}
      />
      <Feather name="search" size={18} color="#999" style={styles.icon} />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: Spacing.SMALL,
    height: 48,
  },
  icon: {
    marginRight: Spacing.SMALL,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
});

export default SearchInput;

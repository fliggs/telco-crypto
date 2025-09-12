// SimpleSelector.tsx
import React from "react";
import { View, useWindowDimensions } from "react-native";
import SimpleSelectorItem from "./Selector";

interface Option {
  id: string;
  label: string;
}

interface SimpleSelectorProps {
  options: Option[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const SimpleSelector: React.FC<SimpleSelectorProps> = ({
  options,
  selectedId,
  onSelect
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = `${100 / options.length - 2}%`;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 8,
        width: "100%"
      }}
    >
      {options.map((opt, index) => (
        <SimpleSelectorItem
          key={opt.id}
          id={opt.id}
          label={opt.label}
          width={itemWidth}
          isSelected={opt.id === selectedId}
          onPress={() => onSelect(opt.id)}
        />
      ))}
    </View>
  );
};

export default SimpleSelector;

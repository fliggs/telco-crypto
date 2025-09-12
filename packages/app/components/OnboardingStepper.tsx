import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Color } from "@/constants";

interface StepperProps {
  currentStep: number;
  totalSteps?: number;
  primaryColor?: boolean;
}

const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps = 5,
  primaryColor = true,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            {
              backgroundColor:
                index + 1 === currentStep
                  ? primaryColor
                    ? Color.PRIMARY
                    : "black"
                  : "#7d807e",
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  step: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
});

export default Stepper;

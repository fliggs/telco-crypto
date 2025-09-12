import { FC, PropsWithChildren } from "react";
import { KeyboardAvoidingView, Platform, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Color, Spacing } from "@/constants";

interface Props extends PropsWithChildren {
  dark?: boolean;
  gap?: Spacing;
  noPaddingBottom?: boolean;
}

const SafeView: FC<Props> = ({ dark, gap, noPaddingBottom, children }) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      collapsable={false}
      style={{
        flex: 1,
        paddingTop: insets.top + Spacing.SMALL,
        paddingBottom: !noPaddingBottom
          ? insets.bottom + Spacing.SMALL
          : undefined,
        backgroundColor: dark ? Color.BLACK : Color.PRIMARY,
      }}
    >
      <StatusBar
        animated
        barStyle={dark ? "light-content" : "dark-content"}
        backgroundColor={dark ? Color.BLACK : Color.PRIMARY}
      />

      <KeyboardAvoidingView
        collapsable={false}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "stretch",
            gap: gap ?? Spacing.MEDIUM,
            paddingHorizontal: Spacing.MEDIUM,
          }}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SafeView;

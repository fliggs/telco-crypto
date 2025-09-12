import React, {
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants";
import { useBottomSheet } from "@/providers/BottomSheetProvider";

import SvgSuccess from "@/assets/icons/success.svg";

import Header from "./Header";

interface Props {
  visible?: boolean;
  trigger?: (show: () => void, close: () => void) => ReactNode;
  onClose?: () => void;
  imageSuccess?: boolean;
  children?: ReactNode | ((close: () => void) => ReactNode);
}

export default function BottomSheet({
  visible,
  trigger,
  onClose,
  imageSuccess,
  children,
}: Props) {
  const { setCurrent } = useBottomSheet();
  const insets = useSafeAreaInsets();
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const show = useCallback(() => {
    bottomSheetModalRef.current?.present();
    setCurrent(bottomSheetModalRef.current);
  }, []);

  const close = useCallback(() => {
    bottomSheetModalRef.current?.close();
    setCurrent(null);
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        style={{ pointerEvents: "box-none" }}
      >
        <View style={{ margin: Spacing.SMALL, marginLeft: 20 }}>
          <Header
            showBack
            onBackPress={() => {
              setTimeout(() => {
                router.back();
              }, 150);
            }}
          />
        </View>
      </BottomSheetBackdrop>
    ),
    []
  );

  const triggerComp = useMemo(
    () => (trigger ? trigger(show, close) : null),
    [trigger, show, close]
  );

  useEffect(() => {
    if (visible) {
      show();
    } else {
      close();
    }
  }, [show, close, visible]);

  return (
    <>
      {triggerComp}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        enablePanDownToClose
        topInset={insets.top}
        enableDynamicSizing
        keyboardBehavior="interactive"
        backdropComponent={renderBackdrop}
        backgroundStyle={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
        onDismiss={() => onClose?.()}
      >
        <View pointerEvents="box-none">
          <BottomSheetScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: Spacing.SMALL,
              paddingTop: Spacing.SMALL,
              paddingBottom: Spacing.MEDIUM,
              rowGap: Spacing.MEDIUM,
              //alignItems: "center",
              pointerEvents: "auto",
            }}
          >
            {imageSuccess && <SvgSuccess style={{ alignSelf: "center" }} />}

            {typeof children === "function" ? children(close) : children}
          </BottomSheetScrollView>
        </View>
      </BottomSheetModal>
    </>
  );
}

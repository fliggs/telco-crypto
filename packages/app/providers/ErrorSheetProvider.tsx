import {
  useContext,
  createContext,
  type PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

import { extractErrorMsg, logError } from "@/util";
import { Color } from "@/constants";
import { Spacing } from "@/constants";
import Text, { TextVariant } from "@/components/Text";
import Button from "@/components/Button";

import Warning from "@/components/Warning";

interface ShowErrorOptions {
  error: string | unknown;
  title?: string;
  buttonText?: string;
  onClose?: () => void;
}

interface ErrorSheetContextProps {
  showError: (options: ShowErrorOptions) => void;
}

const ErrorSheetContext = createContext<ErrorSheetContextProps>({
  showError: () => { },
});

export function useErrorSheet(): ErrorSheetContextProps {
  const value = useContext(ErrorSheetContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useErrorSheet must be wrapped in a <ErrorSheetProvider />"
      );
    }
  }

  return value;
}

interface Props extends PropsWithChildren { }

export function ErrorSheetProvider({ children }: Props) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const lastOnClose = useRef<() => void | undefined>(undefined);

  const showError = useCallback(
    ({ error: err, title, buttonText, onClose }: ShowErrorOptions) => {
      logError(err);

      const errorMessagePromise =
        typeof err === "string" ? Promise.resolve(err) : extractErrorMsg(err);

      lastOnClose.current = onClose; // ✅ Store callback ref

      errorMessagePromise.then((err) => {
        bottomSheetModalRef.current?.present({
          title: title ?? "Something went wrong.",
          buttonText: buttonText ?? "ok",
          error: err,
        });
      });
    },
    []
  );

  const close = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior="close"
        appearsOnIndex={1}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const value = useMemo(() => ({ showError }), [showError]);

  return (
    <ErrorSheetContext.Provider value={value}>
      {children}

      <BottomSheetModal
        ref={bottomSheetModalRef}
        enablePanDownToClose
        enableDynamicSizing
        backdropComponent={renderBackdrop}
        onDismiss={() => {
          if (typeof lastOnClose.current === "function") {
            lastOnClose.current();
          }
        }}
        backgroundStyle={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        {({ data: { title, buttonText, error, onClose } }) => {
          return (
            <BottomSheetScrollView
              contentContainerStyle={{
                flex: 1,
                padding: Spacing.MEDIUM,
                paddingBottom: Spacing.LARGE,
                rowGap: Spacing.MEDIUM,
                alignItems: "flex-start",
              }}
            >
              
              <Warning color={Color.RED} />
              <Text variant={TextVariant.H3} color={Color.BLACK}>
                {title}
              </Text>
              <Text color={Color.BLACK}>{error ?? "Unknown error"}</Text>
              <Button
                style={{
                  alignSelf: "stretch",
                  marginTop: Spacing.MEDIUM,
                }}
                onPress={() => {
                  if (typeof lastOnClose.current === "function") {
                    lastOnClose.current();
                  }
                  close();
                }}
              >
                {buttonText}
              </Button>
            </BottomSheetScrollView>
          );
        }}
      </BottomSheetModal>
    </ErrorSheetContext.Provider>
  );
}

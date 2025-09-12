import {
  useContext,
  createContext,
  type PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

interface BottomSheetContextProps {
  setCurrent: (modal: BottomSheetModal | null) => void;
  closeCurrent: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps>({
  setCurrent: () => {},
  closeCurrent: () => {},
});

export function useBottomSheet(): BottomSheetContextProps {
  const value = useContext(BottomSheetContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useBottomSheet must be wrapped in a <BottomSheetProvider />"
      );
    }
  }

  return value;
}

interface Props extends PropsWithChildren {}

export function BottomSheetProvider({ children }: Props) {
  const [modal, setModal] = useState<BottomSheetModal | null>(null);

  const setCurrent = useCallback(
    (modal: BottomSheetModal | null) => {
      setModal(modal);
    },
    [setModal]
  );

  const closeCurrent = useCallback(() => {
    modal?.close();
  }, [modal]);

  const value = useMemo(
    () => ({ setCurrent, closeCurrent }),
    [setCurrent, closeCurrent]
  );

  return (
    <BottomSheetContext.Provider value={value}>
      <BottomSheetModalProvider>{children}</BottomSheetModalProvider>
    </BottomSheetContext.Provider>
  );
}

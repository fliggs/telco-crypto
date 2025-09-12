import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { useApi } from "./ApiProvider";
import { useErrorSheet } from "./ErrorSheetProvider";

interface SupportContextProps {
  showChat: () => void;
}

const SupportContext = createContext<SupportContextProps>({
  showChat: () => {},
});

export function useSupport(): SupportContextProps {
  const value = useContext(SupportContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSupport must be wrapped in a <SupportProvider />");
    }
  }

  return value;
}

interface Props extends PropsWithChildren {}

export function SupportProvider({ children }: Props) {
  const { credentials, supportApi } = useApi();
  const { showError } = useErrorSheet();

  const showChat = useCallback(async () => {
    try {
      // TODO: Show chat
      throw new Error("not_implemented");
    } catch (err) {
      showError({ error: err });
    }
  }, [credentials]);

  const value = useMemo(() => ({ showChat }), [showChat]);

  return (
    <SupportContext.Provider value={value}>{children}</SupportContext.Provider>
  );
}

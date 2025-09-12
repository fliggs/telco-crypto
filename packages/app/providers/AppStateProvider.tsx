import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";

interface AppStateContextProps {
  state: AppStateStatus;
}

const AppStateContext = createContext<AppStateContextProps>({
  state: AppState.currentState,
});

export function useAppState(): AppStateContextProps {
  const value = useContext(AppStateContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useAppState must be wrapped in a <AppStateProvider />");
    }
  }

  return value;
}

interface Props extends PropsWithChildren {}

export function AppStateProvider({ children }: Props) {
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => subscription.remove();
  }, []);

  return (
    <AppStateContext.Provider value={{ state: appState }}>
      {children}
    </AppStateContext.Provider>
  );
}

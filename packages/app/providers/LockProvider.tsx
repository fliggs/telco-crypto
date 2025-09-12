import {
  useContext,
  createContext,
  type PropsWithChildren,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as LocalAuthentication from "expo-local-authentication";

import { logError } from "@/util";
import SafeView from "@/components/SafeView";

import { useAppState } from "./AppStateProvider";

interface LockContextProps {
  shouldLock: boolean;
  setShouldLock: (shouldLock: boolean) => void;
}

const LockContext = createContext<LockContextProps>({
  shouldLock: false,
  setShouldLock: () => {},
});

export function useLock() {
  const value = useContext(LockContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useLock must be wrapped in a <LockProvider />");
    }
  }

  return value;
}

interface Props extends PropsWithChildren {}

export function LockProvider({ children }: Props) {
  const { state } = useAppState();
  const [isLocked, setIsLocked] = useState(false);
  const [shouldLock, setShouldLock] = useState(false);

  const canEnable = useCallback(async () => {
    try {
      const methods =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      console.log("[LOCK]", "METHODS", methods);
      if (methods.length === 0) {
        return false;
      }

      const isSupported = await LocalAuthentication.hasHardwareAsync();
      console.log("[LOCK]", "isSupported", isSupported);
      if (!isSupported) {
        return false;
      }

      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log("[LOCK]", "isEnrolled", isEnrolled);
      if (!isEnrolled) {
        return false;
      }
      return true;
    } catch (err) {
      logError({ error: err });
      return false;
    }
  }, []);

  const lock = useCallback(async () => {
    console.log("[LOCK]", "locking...");
    const enable = await canEnable();
    console.log("[LOCK]", "locking:", enable);
    if (enable) {
      setIsLocked(true);
    }
  }, [canEnable]);

  const showAuth = useCallback(async () => {
    try {
      const enable = await canEnable();
      if (!enable) {
        setIsLocked(false);
        return;
      }

      const res = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: true,
        promptMessage: "Allow the app to secure the app using biometrics.",
        fallbackLabel: "",
      });

      if (res.success) {
        setIsLocked(false);
      }
    } catch (err) {
      logError({ err });
      setIsLocked(false); // TODO: Disable so we don't lock out the user, maybe we can remove this?
    }
  }, [canEnable]);

  useEffect(() => {
    console.log("[LOCK]", shouldLock, state);
    if (!shouldLock) {
      return;
    }

    if (state === "active") {
      if (isLocked) {
        showAuth();
      }
    } else {
      lock();
    }
  }, [shouldLock, state]);

  if (isLocked) {
    return <SafeView />;
  }

  return (
    <LockContext.Provider value={{ shouldLock, setShouldLock }}>
      {children}
    </LockContext.Provider>
  );
}

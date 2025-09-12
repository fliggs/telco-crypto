import {
  useContext,
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import { AuthProvider, PublicAuthStrategyDto } from "api-client-ts";

import { logError } from "@/util";
import { get, set } from "@/storage";

import { useApi } from "./ApiProvider";

const KEY = "local-strategies";

interface LocalAuthContextProps {
  strategies: PublicAuthStrategyDto[];
  signIn: (strategy: string, email: string, password: string) => Promise<void>;
  signUp: (
    strategy: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  verify: (strategy: string, email: string, code: string) => Promise<void>;
  resendVerify: (strategy: string, email: string) => Promise<void>;
  reset: (strategy: string, email: string) => Promise<void>;
}

const LocalAuthContext = createContext<LocalAuthContextProps>({
  strategies: get<PublicAuthStrategyDto[]>(KEY, []),
  signIn: async () => {},
  signUp: async () => {},
  verify: async () => {},
  resendVerify: async () => {},
  reset: async () => {},
});

export function useLocalAuth() {
  const value = useContext(LocalAuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error(
        "useLocalAuth must be wrapped in a <LocalAuthProvider />"
      );
    }
  }

  return value;
}

interface Props extends PropsWithChildren {}

export function LocalAuthProvider({ children }: Props) {
  const { authApi, setSession } = useApi();

  const [strategies, setStrategies] = useState(
    get<PublicAuthStrategyDto[]>(KEY, [])
  );

  useEffect(() => {
    authApi
      .localFindStrategiesV1({ admin: false })
      .then((strats) => {
        const strategies = strats.filter((s) => s.tags?.includes(Platform.OS));
        setStrategies(strategies);
        set(KEY, strategies);
      })
      .catch(logError);
  }, [authApi]);

  const signIn = useCallback(
    async (strategy: string, email: string, password: string) => {
      const jwt = await authApi.localLoginV1({
        strategy,
        loginDto: { email, password },
      });

      setSession({ provider: AuthProvider.Local, strategy }, jwt);
    },
    [authApi]
  );

  const signUp = useCallback(
    (
      strategy: string,
      email: string,
      password: string,
      firstName: string,
      lastName: string
    ) => {
      console.log("SIGNING UP", email);
      return authApi.localSignupV1({
        strategy,
        signupDto: { email, password, firstName, lastName },
      });
    },
    [authApi]
  );

  const verify = useCallback(
    async (strategy: string, email: string, code: string) => {
      const jwt = await authApi.localVerifyV1({
        strategy,
        verifyDto: { email, code },
      });
      setSession({ provider: AuthProvider.Local, strategy }, jwt);
    },
    [authApi]
  );

  const resendVerify = useCallback(
    async (strategy: string, email: string) => {
      await authApi.localResetVerifyV1({
        strategy,
        resetVerifyDto: { email },
      });
    },
    [authApi]
  );

  const reset = useCallback(
    async (strategy: string, email: string) => {
      await authApi.localResetPasswordV1({
        strategy,
        resetPasswordDto: { email },
      });
    },
    [authApi]
  );

  const value = useMemo(
    () => ({
      strategies,
      signIn,
      signUp,
      verify,
      resendVerify,
      reset,
    }),
    [strategies, signIn, signUp, verify, resendVerify, reset]
  );

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}

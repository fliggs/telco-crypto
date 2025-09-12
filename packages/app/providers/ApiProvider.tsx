import {
  useContext,
  createContext,
  type PropsWithChildren,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  AuthApi,
  AuthProvider,
  Configuration,
  HealthApi,
  MeApi,
  OfferApi,
  OnboardingApi,
  PromoCodeApi,
  SettingsApi,
  TelcoApi,
} from "api-client-ts";
import { add, isAfter } from "date-fns";
import { Platform } from "react-native";

import { get, set } from "@/storage";

const KEY = "session";
const KEY_CREDS = "credentials";
const URL =
  (Platform.OS === "android"
    ? process.env.EXPO_PUBLIC_ANDROID_API_URL
    : null) ?? process.env.EXPO_PUBLIC_API_URL;

interface ApiContextProps {
  credentials: Credentials | null;
  session: Session | null;
  setSession: (session: Session | null, creds?: Credentials) => void;
  authApi: AuthApi;
  healthApi: HealthApi;
  meApi: MeApi;
  onboardingApi: OnboardingApi;
  telcoApi: TelcoApi;
  offerApi: OfferApi;
  settingsApi: SettingsApi;
  promoCodeApi: PromoCodeApi;
}

const ApiContext = createContext<ApiContextProps>({
  credentials: get<Credentials>(KEY_CREDS),
  session: get<Session>(KEY),
  setSession: () => {},
  authApi: new AuthApi(),
  healthApi: new HealthApi(),
  meApi: new MeApi(),
  onboardingApi: new OnboardingApi(),
  telcoApi: new TelcoApi(),
  offerApi: new OfferApi(),
  settingsApi: new SettingsApi(),
  promoCodeApi: new PromoCodeApi(),
});

export interface Session {
  provider: AuthProvider;
  strategy: string;
}

export interface Credentials {
  token: string;
  expires: string;
  refreshToken: string;
}

export function useApi(): ApiContextProps {
  const value = useContext(ApiContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useApi must be wrapped in a <ApiProvider />");
    }
  }

  return value;
}

// This functions locks the refreshing of credentials semaphore-like
// to prevent us from refreshing the credentials for each request that failed.
const listeners: Set<(creds: Credentials | null) => void> = new Set();
async function refreshCreds(refreshToken: string) {
  if (listeners.size > 0) {
    return new Promise<Credentials | null>((resolve) => {
      listeners.add(resolve);
    });
  } else {
    // Add empty listener first so each request coming later uses the other if-branch
    listeners.add(() => {});

    // TODO: Maybe we don't have to hardcode this route?
    const data = await fetch(
      `${URL}/v1/auth/refresh?refreshToken=${refreshToken}`,
      { method: "POST" }
    )
      .then((res) => res.json())
      .catch(() => null);

    listeners.forEach((l) => l(data));
    listeners.clear();

    return data;
  }
}

interface Props extends PropsWithChildren {}

export function ApiProvider({ children }: Props) {
  const [session, doSetSession] = useState(get<Session>(KEY));
  const creds = useRef(get<Credentials>(KEY_CREDS));

  const setSession = useCallback(
    (session: Session | null, newCreds?: Credentials) => {
      set(KEY, session);
      set(KEY_CREDS, newCreds ?? null);
      creds.current = newCreds ?? null;
      doSetSession(session);
    },
    []
  );

  const value = useMemo(() => {
    console.log("[API]", "[BASE]", URL);
    const config = new Configuration({
      basePath: URL,
      credentials: "include",
      middleware: [
        {
          pre: async ({ url, init }) => {
            const headers = init.headers as any;
            headers["x-auth-provider"] = session?.provider ?? "";
            headers["x-auth-strategy"] = session?.strategy ?? "";

            // Check if we have credentials that expired or are about to expire,
            // if yes, then refresh them before doing this request
            if (creds.current) {
              const willExpire = isAfter(
                add(new Date(), { seconds: 10 }),
                creds.current.expires
              );

              if (willExpire) {
                const data = await refreshCreds(creds.current.refreshToken);
                creds.current = data;
              }

              headers.Authorization = `Bearer ${creds.current?.token}`;
            }
          },
          post: async ({ init, url, response }) => {
            console.log(
              `[API]`,
              `[${init.method ?? "GET"}]`,
              url,
              response.status
            );
            if (response.status === 401 || response.status === 403) {
              setSession(null);
            }
          },
        },
      ],
    });

    return {
      session,
      setSession,
      credentials: creds.current,
      authApi: new AuthApi(config),
      healthApi: new HealthApi(config),
      meApi: new MeApi(config),
      onboardingApi: new OnboardingApi(config),
      telcoApi: new TelcoApi(config),
      offerApi: new OfferApi(config),
      settingsApi: new SettingsApi(config),
      promoCodeApi: new PromoCodeApi(config),
    };
  }, [creds.current, session, setSession]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

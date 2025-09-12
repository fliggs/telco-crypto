import {
  useContext,
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as ExpoGoogleAuthentication from "@heartbot/expo-google-authentication";
import { PublicMeDto, UpdateMeDto } from "api-client-ts";

import { get, set } from "@/storage";

import { useApi } from "./ApiProvider";
import { useRouter } from "expo-router";

const KEY = "me";

interface MeContextProps {
  me: PublicMeDto | null;
  refresh: () => Promise<void>;
  update: (dto: UpdateMeDto) => Promise<void>;
  signOut: () => Promise<void>;
}

const MeContext = createContext<MeContextProps>({
  me: get<PublicMeDto>(KEY),
  refresh: async () => {},
  update: async () => {},
  signOut: async () => {},
});

export function useMe(throws?: true): MeContextProps & { me: PublicMeDto };
export function useMe(throws: false): MeContextProps;
export function useMe(
  throws: boolean = true
): MeContextProps & { me: PublicMeDto } {
  const value = useContext(MeContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useMe must be wrapped in a <MeProvider />");
    }
  }

  if (throws && !value.me) {
    throw new Error("Cannot useMe when me is not available");
  }

  // TODO: Hacky typescript fix
  return value as any;
}

interface Props extends PropsWithChildren {}

export function MeProvider({ children }: Props) {
  const { authApi, meApi, session, setSession } = useApi();
  const [me, setMe] = useState(get<PublicMeDto>(KEY));
  const router = useRouter();

  const refresh = useCallback(async () => {
    if (!session) {
      setMe(null);
      set(KEY, null);
      return;
    }

    try {
      const me = await meApi.meFindMeV1();
      setMe(me);
      set(KEY, me);
    } catch {
      setSession(null);
      setMe(null);
      set(KEY, null);
    }
  }, [meApi, session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    setSession(null);
    setMe(null);
    set(KEY, null);
    router.dismissTo("/");
    authApi.authLogoutV1().catch(() => null);
    ExpoGoogleAuthentication.logout().catch(() => null);
  }, [authApi, router]);

  const update = useCallback(
    async (dto: UpdateMeDto) => {
      if (!session) {
        return;
      }

      const jwt = await meApi.meUpdateMeV1({ updateMeDto: dto });
      setSession(session, jwt);
      setMe((oldMe) => (oldMe ? { ...oldMe, ...dto } : null));
    },
    [setSession, setMe, session]
  );

  const value = useMemo(
    () => ({
      me,
      refresh,
      update,
      signOut,
    }),
    [me, refresh, signOut]
  );

  return <MeContext.Provider value={value}>{children}</MeContext.Provider>;
}
